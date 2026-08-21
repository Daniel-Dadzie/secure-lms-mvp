import Link from "next/link";

const courseLinks = [
  { label: 'Mechanical Eng.', href: '/courses?category=mechanical-engineering' },
  { label: 'CNC Programming', href: '/courses?category=cnc-programming' },
  { label: 'CAD & SolidWorks', href: '/courses?category=autocad' },
  { label: 'Robotics', href: '/courses?category=robotics' },
  { label: 'Fluid Mechanics', href: '/courses?category=fluid-mechanics' },
]; //[cite: 5]

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Instructors', href: '/instructors' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: '/blog' },
]; //[cite: 5]

const supportLinks = [
  { label: 'Help Center', href: '/help' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
]; //[cite: 5]

const socialLinks = [
  {
    name: 'X (Twitter)',
    href: 'https://twitter.com',
    hoverClass: 'hover:bg-black hover:text-white',
    svgPath: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    hoverClass: 'hover:bg-[#0A66C2] hover:text-white',
    svgPath: (
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com',
    hoverClass: 'hover:bg-[#FF0000] hover:text-white',
    svgPath: (
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#052E24] text-white py-16 border-t border-[#0A4A3A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid: Adapts cleanly across mobile, tablets (md), and desktops (lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter Column (Spans 2 columns on tablet and desktop) */}
          <div className="md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group inline-flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#196A54] text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white leading-tight">Mech Spec Technologies</span>
                <span className="text-[10px] font-bold text-[#196A54] tracking-widest leading-none">ENGINEERING LMS PLATFORM</span>
              </div>
            </Link>
            
            <p className="text-teal-100/70 text-sm mb-8 max-w-sm leading-relaxed">
              Empowering engineers worldwide with practical, industry-leading technical education.
            </p>
            
            <div className="mb-8">
              <h4 className="text-sm font-bold text-white mb-3">Newsletter</h4>
              <div className="flex flex-col sm:flex-row gap-2 max-w-sm">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="flex-1 bg-[#0A4A3A] border border-[#196A54] rounded-lg px-4 py-2.5 text-sm text-white placeholder-teal-100/50 focus:outline-none focus:border-lime-400 transition-colors"
                />
                <button className="bg-[#196A54] hover:bg-[#12503F] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Real SVG Social Icons with Brand Hover Colors */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`h-10 w-10 rounded-full bg-[#0A4A3A] flex items-center justify-center text-teal-100/80 transition-all shadow-sm ${social.hoverClass}`}
                  aria-label={social.name}
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    {social.svgPath}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns (Spans remaining columns, structured in a compact multi-column grid) */}
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-base font-bold text-white mb-4">Courses</h4>
              <ul className="space-y-3">
                {courseLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-teal-100/70 hover:text-white text-sm font-medium transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-base font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-teal-100/70 hover:text-white text-sm font-medium transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-base font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                {supportLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-teal-100/70 hover:text-white text-sm font-medium transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-[#0A4A3A] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-teal-100/50 text-xs">© 2026 Mech Spec Technologies Ltd. All rights reserved.</p>
          <p className="text-teal-100/50 text-xs flex gap-2">
            <span>WCAG 2.2 AA</span> • <span>Responsive PWA</span> • <span>Desktop, Tablet</span>
          </p>
        </div>

      </div>
    </footer>
  );
}