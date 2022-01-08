import { Schema, model } from "mongoose";

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

var userprofileSchema = new Schema<Userprofile>(
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

export const userprofile = model<Userprofile>("userprofile", userprofileSchema);
