/**
 * FleetManager Pro - Root Application Entry Point
 * 
 * Resolves cloud environments (like Render) that execute 'node index.js'
 * from the project root by forwarding execution directly to the
 * backend server implementation in './server/index.js'.
 */

require('./server/index.js');
