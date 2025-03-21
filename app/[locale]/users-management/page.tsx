"use client"
import Footer from '@/components/footer';
import Header from '@/components/header';
import UsersManagement from '@/components/UsersManagement';

export default function UsersManagerPage() {
    return (
        <main>
            <header>
                <title>Users Manager</title>
            </header>
            <Header/>
            <UsersManagement />
            <Footer/>
        </main>
    );
}