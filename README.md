# Continuous Learning App (Until I can think of a better name at least) 🎒

## Background 

The IT Strategy team at ESDC is currently developing a continuous learning strategy where teams will be required to spend 20% of their time on learning and continuous improvement of daily work. The premise of this application started out from an idea while the IT Strategy team was discussing on using a CATS code ( ESDC internal timesheet tracking system ) to track metrics on whether or not teams are spending 20% of their time learning. 

## Problem Statement ⚙️

We are requiring teams to spend 20% of their time for learning and continuous improvement. It is the managers responsibility to report on what the team has learned and improved. Currently, if the strategy were to role out, this would mean manual tracking and reporting which creates additional burdens on teams taking away from learning and discouraging from adopting the strategy. We have created a CATS code for continuous learning however, it does not allow for insight on the actual learning and improvement


## Why This Repository Exists 🤷‍♂️

Explore providing a tool for teams to be able to crowd source their learning on a team level. Users would be able to add links to resources they have viewed. This would provide two benefits:

- Automated reporting for managers: Managers would be able to get detailed automated reports on team learning. No overburdening them with manual tracking
- Automated knowledge sharing with the rest of the team: A living knowledge base is built on the go which would be searchable, that would allow fast knowledge sharing across the team

There are tools that do something similar to this but on an individual level such as [Instapaper](https://www.instapaper.com/) and [Pocket](https://github.com/Pocket) whereas we are looking for more team and organizational level.


## Tooling and Tech 🧰

This application is using or will be using several different open source technologies. Here is a description of each and why they are used.


[TypeScript](https://www.typescriptlang.org/): Most people know and love JavaScript. TypeScript is considered a super-set of JavaScript which is developed and maintained by Microsoft. You can think of TypeScript as statically typed JavaScript and while there are so much more it offers this is the main premise of the language. Statically typed languages allow for better tooling and less errors as a cause of lack of type saftey. TypeScript combines the best of both worlds from the flexibility of JavaScript and the benifits of a statically typed language.

[NestJS](https://nestjs.com/): NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. How does it do this ? By providing an excellent object oriented framework with full dependency inversion through dependency injection. Now if you're not a dev those words are definitely scary and confusing. It basically means it forces you to code in such a way that allows you to build the application like legos. Like legos you're able to rearrange peices, add peices and remove peices without affecting other peices in the overall application. 

[ReactJS](https://reactjs.org/): ReactJS is a "Front End" framework for building dynamic User Interfaces. It's allows you to create UI components like legos and efficiently snap them together.

[Chakra UI](https://chakra-ui.com/): This is a prebuilt React Component Library focused on accessibility and a cohesive UI.

[Jest](https://jestjs.io/): A testing library for building automated unit and end to end tests for JavaScript applications.

[PostgreSQL](https://www.postgresql.org/): In my opinion the best open source relational database out there. It has awesome features like full text search which allows the processing and indexing of textual documents in many different languages to allow for efficient search. 

[NGINX](https://www.nginx.com/): A fast and efficient open source web server


This list will probably grow as the proof of concept development continues ! 


## More Documentation Coming Soon ! 