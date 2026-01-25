import { Component } from "react";

type Globals = {
    navbar: { setState: (state: { navBarVisibility: boolean; }) => void; } | null;
    showNavbar: ((setState: boolean) => void) | null;
};

const globals: Globals = {
    navbar: null,
    showNavbar: null,
};

export default globals;