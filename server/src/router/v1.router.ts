import { Hono } from 'hono';

import users from './v1/users';
import events from './v1/events';
import company from './v1/company';
import equipment from './v1/equipment';
import project from './v1/projects';
import majors from './v1/majors';
import officers from './v1/officers';

const v1App = new Hono();

v1App.route('/users', users);
v1App.route('/events', events);
v1App.route('/company', company);
v1App.route('/equipment', equipment);
v1App.route('/project', project);
v1App.route('/majors', majors);
v1App.route('/officers', officers);

export default v1App;
