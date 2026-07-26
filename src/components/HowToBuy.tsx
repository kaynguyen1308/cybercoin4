import { useState } from 'react';
import { Copy, Check, ExternalLink, Wallet } from 'lucide-react';

const EXCHANGES = [
  { name: 'UNISWAP', tag: 'DEX', color: 'text-cyber-magenta' },
  { name: 'RAYDIUM', tag: 'DEX', color: 'text-cyber-cyan' },
  { name: 'PANCAKE', tag: 'DEX', color: 'text-cyber-yellow' },
  { name: 'GATE.IO', tag: 'CEX', color: 'text-cyber-green' },
];

const STEPS = [
  { n: '01', title: 'GET A WALLET', body: 'Install MetaMask or Phantom. Write down your seed phrase. Don\'t lose it — we can\'t help you, cyber.' },
  { n: '02', title: 'GRAB SOME ETH/SOL', body: 'Fund your wallet from an exchange. You\'ll need gas to ride the streets.' },
  { n: '03', title: 'CONNECT & SWAP', body: 'Hit a DEX above, paste the contract address, and swap for $CYBER. Slippage: 6.9%.' },
  { n: '04', title: 'WELCOME TO NIGHT CITY', body: 'You\'re in. HODL, meme, and watch the burn vault eat supply. Don\'t go cyberpsycho.' },
];

export default function HowToBuy() {
  const [copied, setCopied] = useState(false);
  const address = '0xCH00MwAk3UpS4muR4id34d0000000000000000';

  const copy = () => {
    navigator.clipboard?.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="buy" className="relative px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center reveal-glitch">
          <div className="font-mono text-xs tracking-[0.4em] text-cyber-yellow animate-flicker">// ACQUISITION PROTOCOL</div>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
            HOW TO <span className="text-cyber-yellow text-glow-yellow rgb-hover">BUY</span>
          </h2>
        </div>

        {/* Contract */}
        <div className="mx-auto mb-12 max-w-2xl">
          <div className="clip-cyber border border-cyber-magenta/40 bg-cyber-dark/70 p-4">
            <div className="mb-2 font-mono text-[10px] tracking-widest text-gray-500">CONTRACT ADDRESS — COPY IT, CYBER</div>
            <div className="flex items-center gap-3">
              <code className="flex-1 truncate font-mono text-sm text-cyber-magenta">{address}</code>
              <button
                onClick={copy}
                className="flex items-center gap-1 border border-cyber-cyan/40 bg-cyber-panel px-3 py-1.5 font-mono text-xs text-cyber-cyan transition-all hover:bg-cyber-cyan/10"
              >
                {copied ? <Check className="h-4 w-4 text-cyber-green" /> : <Copy className="h-4 w-4" />}
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </div>
        </div>

        {/* Exchanges */}
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {EXCHANGES.map((e, i) => (
            <a
              key={i}
              href="#buy"
              className="reveal-pop clip-cyber-sm group flex items-center justify-between border border-cyber-cyan/20 bg-cyber-panel/50 p-4 transition-all hover:border-cyber-cyan/50 hover:box-glow-cyan scan-card"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div>
                <div className={`font-display text-base font-bold ${e.color}`}>{e.name}</div>
                <div className="font-mono text-[10px] tracking-widest text-gray-500">{e.tag}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-500 transition-colors group-hover:text-cyber-cyan" />
            </a>
          ))}
        </div>

        {/* Steps */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={i} className="reveal-pop clip-cyber scan-card holo-card relative border border-cyber-cyan/20 bg-cyber-panel/50 p-6" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="font-display text-5xl font-black text-cyber-cyan/20">{s.n}</div>
              <div className="mt-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-cyber-yellow" />
                <h3 className="font-display text-sm font-bold tracking-wide text-cyber-yellow">{s.title}</h3>
              </div>
              <p className="mt-3 font-body text-sm leading-relaxed text-gray-300">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
