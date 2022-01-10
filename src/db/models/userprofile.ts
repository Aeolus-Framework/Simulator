var mongoose = require("mongoose");

export enum DashboardCardType {
    Consumption,
    Production,
    Buffer,
    ProductionEfficiency,
    WindSpeed,
    Temperature,
    PricePerkWh
}

export enum LoginProvider {
    Google = "Google"
}

interface Userprofile {
    firstname: string;
    lastname: string;
    email: string;
    enabled: boolean;
    disabledUntil: Date;
    dashboard: DashboardCardType[];
    loginProvider: LoginProvider;
}

var userprofileSchema = new mongoose.Schema(
    {
        firstname: String,
        lastname: String,
        enabled: Boolean,
        disabledUntil: Date,
        dashboard: [Number],
        loginProvider: String
    },
    { versionKey: true }
);

export const userprofile = mongoose.model("userprofile", userprofileSchema);
