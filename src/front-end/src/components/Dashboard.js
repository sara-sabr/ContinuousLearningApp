import React from 'react';
import Secured from './Secured'

const Dashboard = () => (
    <Secured hasRealmRole="basic-user" render={() => (
        <div>
            <h2>Dashboard</h2>
        You are now logged in.
        </div>
    )} />
);

export default Dashboard;