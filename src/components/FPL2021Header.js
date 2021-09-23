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

const FPL2021Header = () => {
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
        <HeaderName element={Link} to="/FPL2021" prefix="FPL2021">
        Home
        </HeaderName>
        <HeaderNavigation aria-label="FPL2021">
          <HeaderMenuItem isCurrentPage={location.pathname==='/FPL2021/input'} element={Link} to="/FPL2021/input">Input</HeaderMenuItem>
          <HeaderMenuItem isCurrentPage={location.pathname==='/FPL2021/championship'} element={Link} to="/FPL2021/championship">Championship</HeaderMenuItem>
          <HeaderMenuItem isCurrentPage={location.pathname==='/FPL2021/predictions'} element={Link} to="/FPL2021/predictions">Predictions</HeaderMenuItem>
        </HeaderNavigation>
        <SideNav
          aria-label="Side navigation"
          expanded={isSideNavExpanded}
          isPersistent={false}>
          <SideNavItems>
            <HeaderSideNavItems>
              <HeaderMenuItem isCurrentPage={location.pathname==='/FPL2021/input'} element={Link} to="/FPL2021/input">Input</HeaderMenuItem>
              <HeaderMenuItem isCurrentPage={location.pathname==='/FPL2021/championship'} element={Link} to="/FPL2021/championship">Championship</HeaderMenuItem>
              <HeaderMenuItem isCurrentPage={location.pathname==='/FPL2021/predictions'} element={Link} to="/FPL2021/predictions">Predictions</HeaderMenuItem>
            </HeaderSideNavItems>
          </SideNavItems>
        </SideNav>      
      </Header>
     )}
    />    
    );
  };
  export default FPL2021Header;      