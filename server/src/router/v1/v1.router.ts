import { Hono } from 'hono';

const v1App = new Hono();

// Users
v1App.get('/users', c => c.json({}));

export default v1App;
