import React, { Component } from 'react'
import { Row, Col} from "react-bootstrap"

class Footer extends Component {
  render() {
    return (
      <Row className="footer">
      <Col>Rover Funds - powered by <a href="https://cotrader.com/" target="_blank">CoTrader</a></Col>
      </Row>
    )
  }
}

export default Footer
