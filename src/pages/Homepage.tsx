import { Link } from "react-router";

export default function Homepage() {
    return (
        <div className="h-screen flex items-center justify-center gap-2 animate-in fade-in duration-600">
            <p className="font-black">Homepage</p>
            <Link to={"/dashboard"} className="border-b-2" >View Dashboard</Link>
        </div>
    )
}
