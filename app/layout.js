import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'TipSpark',
  description: 'Spark joy for creators with instant, personalized tips on Base.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
  