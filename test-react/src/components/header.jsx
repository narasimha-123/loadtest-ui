import React from 'react';
import './components.css';
import logo from '../assets/Oracle-Logo.png';
import { Navbar, Col } from 'react-bootstrap';

const Header = () => {
    return (
        <Navbar bg="black" className='shadow p-0 pb-2' style={{ height: "72px" }}>
                <Col sm={6} md={2} className="p-0 text-center text-white m-0 d-inline-flex">
                    {/* <img src={logo} alt="Oracle" className='w-25 mb-2 d-inline'/> */}
                    <h3 className='pt-2 m-0 header-text'>Language Service</h3>
                </Col>
                <Col sm={6} md={9} className="p-0 text-white m-0 d-inline-flex">
                    <h3 className='mb-3'></h3>
                    <h3 className='pt-2 m-0 header-text'>Load Testing Tool</h3>
                </Col>
        </Navbar>
    )
}

export default Header