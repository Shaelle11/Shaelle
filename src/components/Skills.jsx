import researchImg from "../assets/research.jpg";
import frontendEngineeringImg from "../assets/frontend engineering.jpg";
import productManagementImg from "../assets/product management.jpg";

const SKILL_SETS = [
    {
        title: "Research",
        align: "left",
        image: researchImg,
        items: [
            "User interviews",
            "Usability testing",
            "Competitive analysis",
            "Journey mapping",
            "Persona development",
            "A/B testing",
        ],
    },
    {
        title: "Frontend Engineering",
        align: "right",
        image: frontendEngineeringImg,
        items: [
            "HTML5 & semantic markup",
            "CSS, Flexbox & Grid",
            "Tailwind & design systems",
            "JavaScript (ES6+) & TypeScript",
            "React & component architecture",
            "Responsive, mobile-first design",
            "Accessibility (WCAG basics)",
            "REST & GraphQL integration",
            "State management",
            "Testing (Jest, RTL)",
            "Vite / Webpack build tooling",
            "Git & version control",
        ],
    },
    {
        title: "Product Management",
        align: "left",
        image: productManagementImg,
        items: [
            "Roadmapping & prioritization",
            "Writing specs & PRDs",
            "Stakeholder communication",
            "Agile / Scrum facilitation",
            "Metrics & KPI tracking",
            "Cross-functional collaboration",
        ],
    },
];

function SkillRow({ title, items, align, image }) {
    const textOrder = align === "right" ? "md:order-2" : "md:order-1";
    const imageOrder = align === "right" ? "md:order-1" : "md:order-2";

    return (
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
            <div className={`${textOrder} pointer-events-auto`}>
                <h3 className="font-display text-xl sm:text-2xl">{title}</h3>
                <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-dark/70 sm:text-base">
                    {items.map((item) => (
                        <li key={item} className="rounded-full border border-dark/20 px-3 py-1">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className={`${imageOrder} aspect-4/3 overflow-hidden border border-dark/15`}>
                <img src={image} alt={title} className="h-full w-full object-cover" />
            </div>
        </div>
    );
}

export default function Skills() {
    return (
        <div className="flex flex-col gap-16 border-t border-dark/20 pt-12">
            <span className="pointer-events-auto text-xs uppercase tracking-[0.2em] text-blue">
                Skill set
            </span>
            {SKILL_SETS.map((skill) => (
                <SkillRow key={skill.title} {...skill} />
            ))}
        </div>
    );
}
