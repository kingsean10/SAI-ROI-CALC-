import React, { useState } from "react";
import { useForm } from "react-hook-form";
import CountUp from "react-countup";
import { VictoryBar, VictoryChart, VictoryAxis } from "victory";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import api from "../lib/api";

interface FormInputs {
  scope: number;
  dp: number;
  bp: number;
  email: string;
}

const InputField = ({ label, description, unit, register, error, ...props }) => (
  <div className="card">
    <label className="block text-lg font-semibold mb-2">{label}</label>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="relative">
      {props.isMoney && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-500">
          $
        </span>
      )}
      <input
        {...register}
        {...props}
        className={`input-field ${props.isMoney ? 'pl-8' : ''} ${
          error ? 'border-red-500' : ''
        }`}
      />
    </div>
    <p className="mt-2 text-sm text-gray-600">{unit}</p>
    {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
  </div>
);

const ResultCard = ({ label, currentValue, saiValue, isShifts }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
    <div className="text-lg font-medium">{label}</div>
    <div className="flex items-center gap-4">
      <div className="card min-w-[200px] text-center">
        <p className="text-sm text-gray-600">Current Workflow</p>
        <CountUp
          className="text-2xl font-bold text-gray-700"
          end={currentValue}
          decimals={isShifts ? 0 : 2}
          prefix={isShifts ? "" : "$"}
        />
      </div>
      <span className="text-gray-500">vs</span>
      <div className="card card-blue min-w-[200px] text-center">
        <p className="text-sm text-primary">SewerAI Workflow</p>
        <CountUp
          className="text-2xl font-bold text-primary"
          end={saiValue}
          decimals={isShifts ? 0 : 2}
          prefix={isShifts ? "" : "$"}
        />
      </div>
    </div>
  </div>
);

const MAX_DP = 3501;

export default function RoiCalc() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: { scope: 50000, dp: 1500, bp: 2.0 },
  });

  const { scope, dp: rawDp, bp } = watch();

  const dp = rawDp && rawDp < MAX_DP ? rawDp : 1500;
  const saiDP = dp <= 1500 ? dp * 2 : dp * (1 + Math.pow(0.98, (dp - 1500) / 50));
  
  const saiShifts = scope / saiDP;
  const normalShifts = scope / dp;
  
  const currentCostPerShift = (995 + 8 * 45.7 + 8 * 47 + 8 * 65.2 + 2 * 55 + ((dp * 0.1) / (2000 / 8)) * 33.85) * 1.21;
  const saiCostPerShift = currentCostPerShift + 0.25 * saiDP;
  
  const costPerFootSai = saiCostPerShift / saiDP;
  const costPerFootOld = currentCostPerShift / dp;
  
  const profit = (costPerFootOld - costPerFootSai) * scope;
  const additionalProfit = (normalShifts - saiShifts) * (saiDP * bp);

  const onSubmit = async (data: FormInputs) => {
    try {
      setIsSubmitting(true);
      await api.postROIEmail({
        body: {
          projectScope: scope,
          footPerShift: data.dp,
          bidPrice: data.bp.toFixed(2),
          theirCostPerFoot: costPerFootOld.toFixed(2),
          saiCostPerFoot: costPerFootSai.toFixed(2),
          shiftsSAI: saiShifts.toFixed(2),
          theirShifts: normalShifts.toFixed(2),
          email: data.email,
          savings: profit.toFixed(2),
          additionalProfit: additionalProfit.toFixed(2),
        },
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-3xl font-bold text-center mb-4">
          ROI Calculator
        </h1>
        <p className="text-lg text-gray-600 text-center">
          Calculate how SewerAI's AutoCode™ condition assessment solutions can help you save money and increase productivity.
        </p>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Project Details</h2>
          <button
            onClick={() => setShowDisclaimer(!showDisclaimer)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <span>Disclaimer</span>
            <ChevronDownIcon
              className={`w-5 h-5 ml-1 transform transition-transform ${
                showDisclaimer ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {showDisclaimer && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <ul className="space-y-2 text-gray-600">
              <li>• "Current Workflow" refers to condition assessment tasks being manually conducted in the field.</li>
              <li>• Calculations assume standard CCTV crew composition and equipment.</li>
              <li>• Based on typical 6"-12" VCP/CON sanitary sewer inspections in residential areas.</li>
              <li>• Labor rates based on Davis-Bacon Act averages across the US.</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="Project Scope"
            description="Total length to be inspected"
            unit="linear feet"
            type="number"
            register={register('scope', { required: 'This field is required' })}
            error={errors.scope}
          />
          <InputField
            label="Daily Production"
            description="Feet inspected per shift"
            unit="linear feet"
            type="number"
            register={register('dp', { required: 'This field is required' })}
            error={errors.dp}
          />
          <InputField
            label="Bid Price"
            description="Price per linear foot"
            unit="dollars"
            type="number"
            step="0.01"
            isMoney
            register={register('bp', { required: 'This field is required' })}
            error={errors.bp}
          />
        </div>
      </div>

      {rawDp < MAX_DP && (
        <div className="card card-blue">
          <h2 className="text-2xl font-semibold mb-6">Results</h2>
          
          <ResultCard
            label="Shifts to Complete Project"
            currentValue={normalShifts}
            saiValue={saiShifts}
            isShifts={true}
          />
          
          <ResultCard
            label="Cost Per Foot"
            currentValue={costPerFootOld}
            saiValue={costPerFootSai}
            isShifts={false}
          />
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Potential Savings with SewerAI
              </h3>
              <CountUp
                className="text-4xl font-bold text-primary"
                end={profit}
                prefix="$"
                separator=","
                decimals={2}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                Additional Revenue Potential
              </h3>
              <CountUp
                className="text-4xl font-bold text-primary"
                end={additionalProfit}
                prefix="$"
                separator=","
                decimals={2}
              />
            </div>
          </div>
        </div>
      )}

      <div className="card bg-gray-50">
        {submitted ? (
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-success mb-4">
              Thank you for your interest!
            </h3>
            <p className="text-gray-600">
              One of our experts will be in touch shortly to discuss how we can help optimize your operations.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">
              Want a Detailed Analysis?
            </h3>
            <p className="text-gray-600 mb-6">
              Get a customized report for your specific business needs.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field mb-4"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mb-4">{errors.email.message}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? 'Sending...' : 'Get Custom Analysis'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 