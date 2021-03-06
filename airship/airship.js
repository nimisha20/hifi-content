

/*global Entities, Script, acBaton, Vec3 */

(function() {
    Script.include("http://headache.hungry.com/~seth/hifi/baton-client.js");

    var Airship = (function() {
        var _this = this;

        this.batonName = null;
        this.baton = null;

        this.moveAirship = function() {
            var airshipProperties = Entities.getEntityProperties(this.airshipID, ["position", "velocity"]);
            var airshipPosition = airshipProperties.position;
            var airshipVelocity = airshipProperties.velocity;
            var newVelocity = {x: 0, y: 0, z: 0};
            var velocityNeedsUpdate = false;

            if (airshipPosition.z < 65.0 && airshipVelocity.z < 0.0) {
                newVelocity.z = 1.0;
                velocityNeedsUpdate = true;
            } else if (airshipPosition.z > 85.0 && airshipVelocity.z > 0.0) {
                newVelocity.z = -1.0;
                velocityNeedsUpdate = true;
            } else if (Vec3.length(airshipVelocity) < 0.5) {
                newVelocity.z = 1.0;
                velocityNeedsUpdate = true;
            }

            if (velocityNeedsUpdate) {
                if (_this.baton) {
                    _this.baton.claim(
                        function () { // onGrant
                            Entities.editEntity(_this.airshipID, {velocity: newVelocity});
                            _this.baton.release();
                        },
                        null, // onRelease
                        null, // onDenied
                        function () { // onNoServerResponse
                            print("no response from baton-server");
                        }
                    );
                } else {
                    // baton isn't (yet?) working.
                    Entities.editEntity(_this.airshipID, {velocity: newVelocity});
                    _this.baton = acBaton({ batonName: _this.batonName, timeScale: 15000 });
                }
            }
        };

        this.preload = function(entityID) {
            this.airshipID = entityID;

            this.maintenanceInterval = Script.setInterval(function() {
                _this.moveAirship();
            }, 1000);

            this.batonName = 'io.highfidelity.seth.Airship:' + this.airshipID;
            this.baton = acBaton({ batonName: this.batonName, timeScale: 15000 });

            this.moveAirship();
        };
    });

    return new Airship();
});
