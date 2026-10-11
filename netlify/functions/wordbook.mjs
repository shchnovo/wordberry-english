import {getStore} from '@netlify/blobs';
import {createHandler} from '../../server/handler.mjs';
export default createHandler(
 ()=>getStore({name:process.env.WORDLAB_STORE||'wordberry-v1',consistency:'strong'}),
 {registrationCode:process.env.REGISTRATION_CODE||'',log:(...args)=>console.error(...args)}
);
export const config={rateLimit:{action:'rate_limit',aggregateBy:['ip'],windowSize:60,windowLimit:90}};
