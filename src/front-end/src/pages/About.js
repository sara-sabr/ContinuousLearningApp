import React from 'react';
import {Navigation} from "./Navigation"

const About = () => (
    <div className="container">
        <Navigation/>
        <h2>About</h2>

        <h3>Backgroud</h3>
        <p>The IT Strategy team at ESDC is currently developing a continuous learning strategy where teams will be required to spend 20% of their time on learning and continuous improvement of daily work. The premise of this application started out from an idea while the IT Strategy team was discussing on using a CATS code ( ESDC internal timesheet tracking system ) to track metrics on whether or not teams are spending 20% of their time learning.</p>
        <p>The IT Research and Prototyping team at ESDC is currently developing a challenge portal where teams can test and compete on knowledge they learned. The primary user currently is the Research and Prototyping team to have fun while we learn.</p>
        <h3>Problem Statement</h3>
        <p>We are requiring teams to spend 20% of their time for learning and continuous improvement. It is the managers responsibility to report on what the team has learned and improved. Currently, if the strategy were to role out, this would mean manual tracking and reporting which creates additional burdens on teams taking away from learning and discouraging from adopting the strategy. We have created a CATS code for continuous learning however, it does not allow for insight on the actual learning and improvement</p>
    </div>
);

export default About;