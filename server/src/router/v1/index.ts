import { OpenAPIHono } from '@hono/zod-openapi';
import type { Context } from '@/lib/context';

import authRouter from '@/router/v1/auth';
import userRouter from '@/router/v1/users';
import projectRouter from '@/router/v1/projects';
import eventRouter from '@/router/v1/events';
import companyRouter from '@/router/v1/companies';
import equipmentRentalRouter from '@/router/v1/equipments';
import majorRouter from '@/router/v1/major';
import enumRouter from '@/router/v1/enum';
import sponsorRouter from '@/router/v1/sponsor';
import officerRouter from '@/router/v1/officer';
import blacklistRouter from '@/router/v1/blacklist';
import clubRouter from '@/router/v1/club';
import paymentRouter from '@/router/v1/payments';
import searchRouter from './search';
import emailRouter from '@/router/v1/email';

const v1App = new OpenAPIHono<Context>();

v1App.route('/auth', authRouter);
v1App.route('/users', userRouter);
v1App.route('/projects', projectRouter);
v1App.route('/events', eventRouter);
v1App.route('/companies', companyRouter);
v1App.route('/equipments', equipmentRentalRouter);
v1App.route('/majors', majorRouter);
v1App.route('/enums', enumRouter);
v1App.route('/sponsors', sponsorRouter);
v1App.route('/officers', officerRouter);
v1App.route('/blacklist', blacklistRouter);
v1App.route('/club', clubRouter);
v1App.route('/payments', paymentRouter);
v1App.route('/search', searchRouter);
v1App.route('/emails', emailRouter);

export default v1App;
