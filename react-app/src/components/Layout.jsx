import { Link } from "react-router-dom";
import React from "react";

export default function Navigation() {
  return (
    <div>
      <Link to="/"> Home </Link>
      <Link to="/about"> About </Link>
      <Link to="/todo"> TODO </Link>
    </div>
  );
}