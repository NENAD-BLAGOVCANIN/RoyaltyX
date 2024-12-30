import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { BoxArrowRight, PersonCircle, UiChecksGrid } from 'react-bootstrap-icons';
import placeholderProfileImage from '../../assets/img/profile.svg';

function UserDropdown() {
    return (
        <Dropdown className='d-flex align-items-center'>
            <Dropdown.Toggle variant="basic" id="dropdown-basic" className="p-0 border-0 bg-transparent">
                <img
                    src={placeholderProfileImage}
                    className="rounded pointer"
                    style={{ width: 28, height: 28, objectFit: 'cover' }}
                    alt="Profile"
                />
            </Dropdown.Toggle>

            <Dropdown.Menu className='border-0 shadow rounded-lg mt-2 px-2' align="end" style={{ width: 290, background: 'var(--color-body-background)' }}>
                <div className='d-flex align-items-center pt-1 px-2'>
                    <div className='position-relative'>
                        <img src={placeholderProfileImage} className='rounded' style={{ width: 30, height: 30, objectFit: 'cover' }} alt="" />
                    </div>
                    <div className='d-flex flex-column ps-3'>
                        <span className='medium fw-500' style={{ color: 'var(--color-text)' }}>Trae Dungy</span>
                        <span className='small txt-lighter'>trae.dungy@gmail.com</span>
                    </div>
                </div>

                <Dropdown.Divider />

                <Dropdown.Item as={Link} to="/admin/dashboard">
                    <UiChecksGrid /> <span className='ps-3 medium'>Admin Panel</span>
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/account">
                    <PersonCircle /> <span className='ps-3 medium'>My Account</span>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item as={Link} to="/logout" className="text-danger">
                    <BoxArrowRight className='text-danger' /> <span className='ps-3 medium text-danger'>Logout</span>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown >
    );
}

export default UserDropdown;
