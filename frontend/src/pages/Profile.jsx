import React, {useEffect, useState} from 'react';
import './NavBarPages.css';
import './Profile.css';
import { getGroupName } from '../constants/groups';

const Profile = () => {
    const [userData, setUserData] = useState({
        firstName:'',
        lastName:'',
        email:'',
        role:'',
        groups:[]
    });

    useEffect(()=>{
        const role=localStorage.getItem('role');
        console.log("Student data in localStorage:", {
        firstName: localStorage.getItem('studentFirstName'),
        lastName: localStorage.getItem('studentLastName'),
        email: localStorage.getItem('studentEmail'),
        group: localStorage.getItem('studentGroup')
        });
        //professor
        if(role==='1'){
            const professorGroups = localStorage.getItem('professorGroups');
            let parsedGroups = [];
            if (professorGroups && professorGroups !== "undefined") {
            try {
                parsedGroups = JSON.parse(professorGroups);
            } catch (e) {
                console.error("Error parsing professor groups:", e);
            }
        }
            setUserData({
                firstName:localStorage.getItem('professorFirstName')||'',
                lastName:localStorage.getItem('professorLastName')||'',
                email:localStorage.getItem('professorEmail')||'',
                role: 'Professor',
                groups: parsedGroups
            });
        }
        //student
        else if(role==='2'){
            setUserData({
                firstName:localStorage.getItem('studentFirstName')||'',
                lastName:localStorage.getItem('studentLastName')||'',
                email:localStorage.getItem('studentEmail')||'',
                role: 'Student',
                groups: [localStorage.getItem('studentGroup') || '']
            });
        }
    }, []);
    return (
        <div className='page-layout'>
            <div className='page-components'>
                <div className='profile-container'>
                    <div className='profile-header'>
                        <div className='profile-name'>
                            <h2>{userData.firstName} {userData.lastName}</h2>
                            <span className='profile-role'>{userData.role}</span>
                        </div>
                    </div>
                    <div className='profile-details'>
                        <div className='profile-detail'>
                            <span className='detail-label'>Email:</span>
                            <span className='detail-value'>{userData.email}</span>
                        </div>
                        
                        {userData.role === 'Student' && userData.groups[0] && (
                            <div className='profile-detail'>
                                <span className='detail-label'>Group:</span>
                                <span className='detail-value'>{getGroupName(userData.groups[0])}</span>
                            </div>
                        )}
                        {userData.role === 'Professor' && (
                            <div className='profile-detail'>
                                <span className='detail-label'>Groups:</span>
                                <div className='groups-list'>
                                    {userData.groups && userData.groups.length > 0 ? (
                                        userData.groups.map(group => (
                                            <span key={group} className='group-tag'>
                                                {getGroupName(group)}
                                            </span>
                                        ))
                                    ) : (
                                        <span className='no-groups'>No groups assigned</span>
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                </div>
        </div>
        </div>
    );
};

export default Profile;