export default function Contact() {
    return (
        <div className="pointer-events-auto flex flex-col items-start gap-6 border-t border-dark/20 pt-12">
            <span className="text-xs uppercase tracking-[0.2em] text-blue">Get in touch</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Let's build something.</h2>
            <a
                href="https://calendar.app.google/M69bCdY4izEja62V6"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-none border-4 border-green bg-transparent px-8 py-4 text-sm font-medium tracking-wide text-green transition-colors duration-300 hover:bg-green hover:text-light"
            >
                Book a Chat
            </a>
        </div>
    );
}
