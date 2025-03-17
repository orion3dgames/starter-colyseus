class Config {
    // general settings
    title = "BomberMan Mayhem";
    version = "Version 0.0.1";
    lang = "en";

    // server settings
    port = 2567;
    maxClients = 20; // set maximum clients per room
    updateRate = 100; // Set frequency the patched state should be sent to all clients, in milliseconds
    databaseUpdateRate = 10000; // the frequency at which server save players position

    // players
    speed = 1;

    // theme
    fontFamily = "luckiest_guy";
    primary_color = "purple";
    secondary_color = "orange";
    button = {
        background: "purple",
        color: "white",
        height: 50,
        fontSize: 24,
    };
}

export { Config };
