
import { Link } from "react-router-dom";

export function HeaderLogo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <span className="text-xl font-bold tracking-tight">SalesMan</span>
    </Link>
  );
}
