import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import _ from "lodash";

import { TetrisGame } from "./TetrisGame";

interface RoomCoverProps {
  socket: SocketIOClient.Socket;
}

const MainBox = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const MainBoxReadyUp = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1;
  align-items: center;
  justify-content: space-evenly;
  flex-direction: column;
`;

const PlayerBox = styled.div<{ ready: boolean }>`
  display: flex;
  max-height: 20%;
  max-width: 40%;
  background-color: ${(props) => (props.ready ? "green" : "red")};
  padding: 1%;
`;

export const RoomCover: React.FunctionComponent<RoomCoverProps> = (props) => {
  let { socket } = props;
  let [started, setStarted] = useState(false);
  let [ready, setReady] = useState(false);
  let [roles, _setRoles] = useState(new Map<string, boolean>());
  let [ourName, _setOurName] = useState("");
  let [host, setHost] = useState(false);

  let ourNameRef = useRef(ourName);
  let setOurName = (name: string) => {
    ourNameRef.current = name;
    _setOurName(name);
  };

  let rolesRef = useRef(roles);
  let setRoles = (roles: Map<string, boolean>) => {
    rolesRef.current = roles;
    _setRoles(roles);
  };

  useEffect(() => {
    socket.on("roles", (data: string, ourName: string) => {
      console.log("got back", data);
      setRoles(new Map(JSON.parse(data)));
      setOurName(ourName);
    });

    socket.on("roles_update", (data: string) => {
      console.log("got update", data);
      setRoles(new Map(JSON.parse(data)));
    });

    socket.on("start", () => {
      let ourName = ourNameRef.current;
      let roles = rolesRef.current;
      console.log("Setting Host!", _.min(Array.from(roles.keys())) == ourName);
      setHost(_.min(Array.from(roles.keys())) == ourName);
      console.log("I am Host: ", ourName === _.min(Array.from(roles.keys())));
      setStarted(true);
    });

    socket.emit("get_roles");
  }, []);

  console.log("roles are", roles);
  console.log("roles.values are", Array.from(roles.values()));
  if (started)
    return (
      <MainBox>
        <TetrisGame
          socket={socket}
          host={host}
          background_color={{ red: 100, green: 100, blue: 100 }}
          empty_cell_color={{ red: 220, green: 220, blue: 220 }}
        />
      </MainBox>
    );
  else {
    return (
      <MainBoxReadyUp>
        Player {Array.from(roles.keys()).indexOf(ourName)}
        {Array.from(roles.keys()).map((key: string, index: number) => (
          <PlayerBox ready={roles.get(key) ?? true} key={key}>
            Player {index} {roles.get(key) ? "Ready" : "Not Ready"}
          </PlayerBox>
        ))}
        {!ready ? (
          <Button
            disabled={ready}
            variant="primary"
            onClick={() => {
              setReady(true);
              socket.emit("ready");
            }}
          >
            Ready Up!
          </Button>
        ) : (
          <Button
            disabled={!_.every(Array.from(roles.values()))}
            variant="success"
            onClick={() => socket.emit("start")}
          >
            Start
          </Button>
        )}
      </MainBoxReadyUp>
    );
  }
};
