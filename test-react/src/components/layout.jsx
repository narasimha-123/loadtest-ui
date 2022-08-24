import React from "react";
import { Header, Sidebar, Footer } from './index'
import { Outlet } from "react-router-dom";
import './components.css';
import { Container, Row, Col } from "react-bootstrap";

const Layout = () => {
  return (
    <>
      <Container fluid className="h-100">
        <Row className="h-100">
          <Col className="col-1 p-0"><Sidebar/></Col>
          <Col className="col-11 bg-light p-0">
            <Header />
            <Outlet />
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default Layout;