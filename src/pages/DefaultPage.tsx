import { Link } from "react-router"

function DefaultPage() {
    return (
        <div className="flex items-center justify-center h-screen gap-2">
            <p>default page routing mismatch</p>
            <Link to={"/"} className="border-b-2" >Home</Link>
        </div>
    )
}

export default DefaultPage