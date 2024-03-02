/* eslint-disable react/prop-types */
import { Accordion } from "react-bootstrap"
import UserDataTable from "./Darts/UserDataTable";

function MyAccordion({ users, game }) {
  return (
    <Accordion data-bs-theme="dark" defaultActiveKey="0">
      <Accordion.Item eventKey="0">
        <Accordion.Header>Live Data</Accordion.Header>
        <Accordion.Body>
          <UserDataTable users={users} game={game} />
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}

export default MyAccordion