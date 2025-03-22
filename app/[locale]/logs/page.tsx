import Footer from "@/components/footer";
import Header from "@/components/header";
import LogsPage from "@/components/LogsPage";

export default function Logs(){
    return (
        <div>
            <header>
                <title>Logs</title>
            </header>
            <Header/>
            <LogsPage/>
            <Footer/>
        </div>
    );
}