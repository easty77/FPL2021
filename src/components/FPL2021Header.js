import React, { useState, useEffect } from 'react';
import {
  Header,
  HeaderMenu,
  HeaderMenuItem,
  HeaderName,
  HeaderNavigation,
  PropTypes,
  SkipToContent,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
  HeaderMenuButton,
  HeaderContainer
} from 'carbon-components-react';
import {Link, useLocation} from 'react-router-dom';

const FPL2021Header = ({isLoggedIn, facebookName, facebookPicture}) => {
  const location = useLocation()

    return (
      <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
      <Header aria-label="IBM Platform Name">
        <SkipToContent />
        <HeaderMenuButton
          aria-label="Open menu"
          onClick={onClickSideNavExpand}
          isActive={isSideNavExpanded}
        />
        <HeaderName element={Link} to="/" prefix="FPL2021">
        Home
        </HeaderName>
        <HeaderNavigation aria-label="FPL2021">
          { isLoggedIn &&
          <HeaderMenuItem isCurrentPage={location.pathname==='/input'} element={Link} to="/input">Input</HeaderMenuItem>
        }
          <HeaderMenuItem isCurrentPage={location.pathname==='/championship'} element={Link} to="/championship">Championship</HeaderMenuItem>
          <HeaderMenuItem isCurrentPage={location.pathname==='/predictions'} element={Link} to="/predictions">Predictions</HeaderMenuItem>
          { facebookName === 'Simon East' &&
          <HeaderMenuItem isCurrentPage={location.pathname==='/admin'} element={Link} to="/admin">Admin</HeaderMenuItem>
          }
        </HeaderNavigation>
        <SideNav
          aria-label="Side navigation"
          expanded={isSideNavExpanded}
          isPersistent={false}>
          <SideNavItems>
            <HeaderSideNavItems>
              { isLoggedIn &&
              <HeaderMenuItem isCurrentPage={location.pathname==='/input'} element={Link} to="/input">Input</HeaderMenuItem>
              }
              <HeaderMenuItem isCurrentPage={location.pathname==='/championship'} element={Link} to="/championship">Championship</HeaderMenuItem>
              <HeaderMenuItem isCurrentPage={location.pathname==='/predictions'} element={Link} to="/predictions">Predictions</HeaderMenuItem>
              { facebookName === 'Simon East' &&
                <HeaderMenuItem isCurrentPage={location.pathname==='/admin'} element={Link} to="/admin">Admin</HeaderMenuItem>
              }
          </HeaderSideNavItems>
          </SideNavItems>
        </SideNav>    
        { facebookPicture !== null &&
        <img  style={{"align-self":"flex-end"}} src={facebookPicture} width="50" height="50" />
        }  
      </Header>
     )}
    />    
    );
  };
  export default FPL2021Header;      