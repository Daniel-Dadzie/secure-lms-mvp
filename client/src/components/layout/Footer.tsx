import Link from "next/link";

const courseLinks = [
  { label: 'Mechanical Eng.', href: '/courses?category=mechanical-engineering' },
  { label: 'CNC Programming', href: '/courses?category=cnc-programming' },
  { label: 'CAD & SolidWorks', href: '/courses?category=autocad' },
  { label: 'Robotics', href: '/courses?category=robotics' },
  { label: 'Fluid Mechanics', href: '/courses?category=fluid-mechanics' },
];

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Instructors', href: '/instructors' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: '/blog' },
];

const supportLinks = [
  { label: 'Help Center', href: '/help' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
];

export default function Footer() {
  return (
    <footer className="bg-[#052E24] text-white py-16 border-t border-[#0A4A3A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter Column (Takes 2 spaces) */}
          <div className="lg:col-span-2">
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
              <div className="flex gap-2 max-w-sm">
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

            <div className="flex gap-4">
              {['X', 'In', 'Yt'].map((icon, i) => (
                <button key={i} className="h-10 w-10 rounded-full bg-[#0A4A3A] flex items-center justify-center text-teal-100/70 hover:bg-[#196A54] hover:text-white transition-colors">
                  <span className="text-xs font-bold">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Courses</h4>
            <ul className="space-y-4">
              {courseLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-teal-100/70 hover:text-white text-sm font-medium transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-teal-100/70 hover:text-white text-sm font-medium transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white mb-6">Support</h4>
            <ul className="space-y-4">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-teal-100/70 hover:text-white text-sm font-medium transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

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