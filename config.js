module.exports = {
  ipaddr: process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0",
  port: process.env.OPENSHIFT_NODEJS_PORT || 3000
}