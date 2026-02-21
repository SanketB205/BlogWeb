export default function Footer() {
    return (
        <footer className="py-6 border-t text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} MyBlog. All rights reserved.
        </footer>
    );
}
