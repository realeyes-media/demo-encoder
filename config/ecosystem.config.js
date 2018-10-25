module.exports = {
    apps : [{
        name: "encoder",
        script: "./dist/bin/www.js",
        env: {
        NODE_ENV: "development",
        },
        env_production: {
        NODE_ENV: "production",
        }
    }]
}