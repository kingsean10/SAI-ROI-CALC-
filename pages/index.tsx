import type { NextPage } from 'next';
import RoiCalc from '../components/RoiCalc';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ROI Calculator - SewerAI</title>
        <meta name="description" content="Calculate your potential savings and ROI with SewerAI's AutoCode™ condition assessment solutions." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <RoiCalc />
        </div>
      </main>
    </>
  );
};

export default Home; 