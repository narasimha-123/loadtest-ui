import React from 'react';
import logo from '../assets/Oracle_logo.svg';
import { ReactComponent as ActiveIcon} from '../assets/active.svg';
import './components.css';
import { Link } from "react-router-dom";
import { Navbar } from 'react-bootstrap';
import { FaPlus, FaHistory, } from 'react-icons/fa';
import { HiOutlineDocument } from 'react-icons/hi';
import { useState } from 'react';

// const ImgOrAlt = ({ src, alt = FaHistory, ...props }) => {
//   /*
//   This function displays the target image if its available, but
//   only displays alt text (without the broken image icon) when the 
//   target image isn't available. User can pass in extra props acceptable to the img tag 
//   https://github.com/Radi-dev/React-Img-or-alt/blob/main/src/ImgOrAlt.js */
//   const altImg = alt;
//   const clickHandler = () => {
//     setImg(altImg);
//   };
//   const imgJsx = (
//     <img src={activeIcon} className="w-50" onError={clickHandler} {...props}></img>
//   );
//   const [Img, setImg] = useState(imgJsx);
//   return Img;
// };

const Sidebar = () => {
  const getLocation = () => {
    return (window.location.pathname.substring(1) ? window.location.pathname.substring(1) : 'newTest');
  };
  const sideTabsList = [
    {
      id: "newTest",
      itemName: "New Test",
      toLink: "/",
      iconSize: "2rem",
      iconComponent: FaPlus
    },
    {
      id: "activeTests",
      itemName: "Active Tests",
      toLink: "/activeTests",
      iconSize: "3rem",
      iconComponent: ActiveIcon
    },
    {
      id: "history",
      itemName: "History",
      toLink: "/history",
      iconSize: "2rem",
      iconComponent: FaHistory
    },
    // {
    //   id: "docs",
    //   itemName: "Docs",
    //   toLink: "/docs",
    //   iconSize: "2.2rem",
    //   iconComponent: HiOutlineDocument
    // },
  ];
  const [activeId, setActiveId] = useState(getLocation());
  return (
    <Navbar expand="lg" className="sidebar p-0 flex-column justify-content-start h-100">
      <ul className="nav flex-column w-100">
        <li className='d-flex border-bottom logo-height w-100 bg-black p-2 align-items-center'  style={{ height: "73px" }} >
          <div className='col icon'>
            <img src={logo} alt="Oracle" className='w-100'/>
          </div>
        </li>
        {sideTabsList.map(item=>{
          return (
            <li key={item.id} className={`nav-item w-100 ${activeId == `${item.id}` && 'active'}`} onClick={() => setActiveId(`${item.id}`)}>
              <Link to={item.toLink} className="nav-link px-2 py-3" >
                <div className={`col icon ${'docs' == `${item.id}` && 'icon-doc'}`}>
                  <item.iconComponent size={item.iconSize}/>
                </div>
                <div className='col text-center'>{item.itemName}</div>
              </Link>
            </li>
          );
        })
        }

      </ul>
    </Navbar>
  )
}

export default Sidebar