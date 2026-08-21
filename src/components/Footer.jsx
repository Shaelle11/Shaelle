import githubIcon from "../assets/github-svgrepo-com.svg";
import linkedinIcon from "../assets/linkedin-logo-thin-svgrepo-com.svg";
import pinterestIcon from "../assets/pinterest-svgrepo-com.svg";

const SOCIALS = [
    { label: "GitHub", icon: githubIcon, href: "https://github.com/Shaelle11" },
    {
        label: "LinkedIn",
        icon: linkedinIcon,
        href: "https://www.linkedin.com/in/nanji-lakan-theshaelle/",
    },
    { label: "Pinterest", icon: pinterestIcon, href: "https://www.pinterest.com/The_Shaelle/" },
    { label: "Email", href: "mailto:lakannanji@gmail.com" },
];

export default function Footer() {
    return (
        <footer className="pointer-events-auto flex flex-col gap-6 border-t border-dark/20 pt-8 pb-2 text-sm text-dark/60">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <span>© 2026. Built with React, Tailwind, and Framer Motion.</span>
                <div className="flex items-center gap-3">
                    {SOCIALS.map((s) => (
                        <a
                            key={s.label}
                            href={s.href}
                            target={s.icon ? "_blank" : undefined}
                            rel={s.icon ? "noopener noreferrer" : undefined}
                            aria-label={s.label}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-dark/20 text-xs font-medium text-dark/60 transition-colors hover:border-dark hover:text-dark"
                        >
                            {s.icon ? <img src={s.icon} alt="" className="h-4 w-4" /> : "@"}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
