import React, { useState } from 'react';
import { HOTLINKED_IMAGES } from '../data/mockData';
import { TaaziTokariEmblem } from './BrandLogo';

export type OpsTab = 'procure' | 'qc' | 'pack' | 'deliver';

interface OpsAppProps {
  activeTab: OpsTab;
  setActiveTab: (tab: OpsTab) => void;
  onSwitchWorkspace?: () => void;
  embeddedMode?: boolean;
}

export const OpsApp: React.FC<OpsAppProps> = ({
  activeTab,
  setActiveTab,
  onSwitchWorkspace,
  embeddedMode = false,
}) => {
  // Procure tab state
  const [demandStepper, setDemandStepper] = useState(70);
  const [targetStepper, setTargetStepper] = useState(70);
  const [tamatarBought, setTamatarBought] = useState(55);
  const [kheeraBought, setKheeraBought] = useState(32);

  // Pack tab state
  const [packQueueFilter, setPackQueueFilter] = useState<'pending' | 'in-progress' | 'shortage'>(
    'in-progress'
  );
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    aloo: true,
    tamatar: true,
    palak: true,
    combo: true,
  });
  const [packedCount, setPackedCount] = useState(54);
  const [activeCrateId, setActiveCrateId] = useState('#AM-84920');

  // Deliver tab state
  const [deliveredStops, setDeliveredStops] = useState(19);
  const [pendingStops, setPendingStops] = useState(8);
  const [photoSnapped, setPhotoSnapped] = useState(false);

  // QC tab state
  const [qcChecks, setQcChecks] = useState<Record<string, boolean>>({
    ozone: true,
    moisture: true,
    brix: true,
    weighbridge: true,
  });
  const [ozoneTimerActive, setOzoneTimerActive] = useState(false);
  const [ozoneSeconds, setOzoneSeconds] = useState(180);
  const [cullQtyKg, setCullQtyKg] = useState(3.2);
  const [brixValue, setBrixValue] = useState(4.8);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const togglePackItem = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allFourChecked = Object.values(checkedItems).every(Boolean);

  return (
    <div
      className={`w-full max-w-[430px] mx-auto bg-[#f3faf2] text-[#151e17] font-body-md flex flex-col relative shadow-[0_12px_40px_rgba(2,52,30,0.12)] border border-[#dbe5da] ${
        embeddedMode
          ? 'rounded-[32px] overflow-hidden'
          : 'min-h-screen sm:rounded-[32px] sm:my-4 overflow-hidden'
      }`}
    >
      {/* TOP OPS HEADER */}
      <header className="bg-[#f3faf2] px-3.5 pt-3.5 pb-2.5 sticky top-0 z-30 border-b border-[#e1ebe0]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <TaaziTokariEmblem size={38} className="shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-[17px] font-bold text-[#02341e] leading-tight tracking-tight truncate">
                Taazi Tokari
              </span>
              <span className="text-[11px] font-bold text-[#835400] truncate">
                Eldeco Elegance Pilot #LKO-24
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (onSwitchWorkspace) onSwitchWorkspace();
                else showToast('Lead Ops Role Active • Node #LKO-EAST-01');
              }}
              className="px-2.5 py-1 rounded-xl bg-[#e6f1e5] hover:bg-[#dbe5da] text-[#151e17] text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Switch Role / Console"
            >
              <span className="leading-tight text-left">
                Lead
                <br />
                Ops
              </span>
              <span className="material-symbols-outlined text-[15px] text-[#414943]">
                swap_horiz
              </span>
            </button>

            <button
              onClick={() => showToast('Operator Verified: Shift #04-Mandi-Morning')}
              className="w-9 h-9 rounded-full bg-[#0b3b24] text-white flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined text-[19px]">person</span>
            </button>
          </div>
        </div>

        {/* Sub-header row with current screen title & shift pill */}
        <div className="flex items-center justify-between mt-2.5">
          <h1 className="font-headline-sm text-[21px] font-extrabold text-[#151e17] tracking-tight capitalize">
            {activeTab === 'qc' ? 'QC & Inward' : activeTab}
          </h1>
          <div className="px-2.5 py-1 rounded-full bg-[#e6f1e5] text-[#414943] text-[11px] font-semibold flex items-center gap-1.5 tabular-nums">
            <span className="w-2 h-2 rounded-full bg-[#e59b24]" />
            <span>Shift 04:00 – 10:30 AM</span>
          </div>
        </div>
      </header>

      {/* MAIN OPS CONTENT */}
      <div className="flex-1 pb-24">
        {/* ========================================================= */}
        {/* OPS TAB 1: PROCURE (Exact match to Image 18.jpeg)         */}
        {/* ========================================================= */}
        {activeTab === 'procure' && (
          <div className="px-3.5 pt-3 flex flex-col gap-3">
            {/* Batch Status Banner */}
            <div className="bg-[#e3efe2] rounded-2xl p-3.5 border border-[#d2e3d0]">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-headline-sm text-[16px] font-bold text-[#151e17] font-mono">
                  BATCH #LKO-24-001
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#d3e6d1] text-[#02341e] text-[11px] font-bold">
                  Dawn Sourcing Active
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px] text-[#414943]">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#02341e]">lock</span>
                  <span>Cut-off frozen at 12:00 AM</span>
                </div>
                <span className="truncate max-w-[140px]">• Dubagga & Sitapur</span>
              </div>
            </div>

            {/* 2-Column Top Summary Cards */}
            <div className="grid grid-cols-2 gap-2.5 tabular-nums">
              {/* Left: PRE-ORDER DEMAND */}
              <div className="bg-white rounded-2xl p-3 border border-[#e1ebe0] shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10.5px] font-bold uppercase text-[#414943] mb-1">
                    <span className="flex items-center gap-1">
                      PRE-ORDER DEMAND
                      <span className="material-symbols-outlined text-[14px] text-[#835400]">
                        groups
                      </span>
                    </span>
                    <span className="material-symbols-outlined text-[15px] text-[#835400]">
                      payments
                    </span>
                  </div>
                  <div className="text-[23px] font-extrabold text-[#151e17] leading-none">
                    248.5 <span className="text-[13px] font-normal text-[#414943]">kg</span>
                  </div>
                  <span className="text-[10.5px] text-[#414943] block mt-1">
                    78 pre-orders • Eldeco Elegance
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-[#f2fcf1] flex items-center justify-between gap-1">
                  <div>
                    <span className="text-[9.5px] text-[#414943] block leading-tight">
                      Wholesale
                      <br />
                      Rate
                    </span>
                    <span className="text-[12.5px] font-extrabold text-[#151e17]">
                      ₹22.50<span className="text-[10px] font-normal">/kg</span>
                    </span>
                  </div>

                  <div className="flex items-center bg-[#ecf6eb] rounded-lg px-1.5 py-1 gap-1.5 border border-[#dbe5da]">
                    <span className="text-[12px] font-bold text-[#151e17]">{demandStepper}</span>
                    <button
                      onClick={() => setDemandStepper((v) => v + 1)}
                      className="text-[#02341e] font-bold text-sm leading-none"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[9.5px] font-bold text-[#151e17] leading-tight text-right">
                    +3 kg
                    <br />
                    surplus
                  </span>
                </div>
              </div>

              {/* Right: PROCURE TARGET */}
              <div className="bg-white rounded-2xl p-3 border border-[#e1ebe0] shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10.5px] font-bold uppercase text-[#414943] mb-1">
                    <span>PROCURE TARGET</span>
                    <span className="material-symbols-outlined text-[15px] text-[#02341e]">
                      Equalizer
                    </span>
                  </div>
                  <div className="text-[23px] font-extrabold text-[#02341e] leading-none">
                    285.0 <span className="text-[13px] font-normal text-[#414943]">kg</span>
                  </div>
                  <span className="text-[10.5px] text-[#414943] block mt-1">
                    +36.5 kg Buffer Eldeco
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-[#f2fcf1] flex items-center justify-between gap-1">
                  <div>
                    <span className="text-[9.5px] text-[#414943] block leading-tight">
                      Wholesale
                      <br />
                      Rate
                    </span>
                    <span className="text-[12.5px] font-extrabold text-[#151e17]">
                      ₹35.00<span className="text-[10px] font-normal">/kg</span>
                    </span>
                  </div>

                  <div className="flex items-center bg-[#ecf6eb] rounded-lg px-1.5 py-1 gap-1.5 border border-[#dbe5da]">
                    <span className="text-[12px] font-bold text-[#151e17]">{targetStepper}</span>
                    <button
                      onClick={() => setTargetStepper((v) => v + 1)}
                      className="text-[#02341e] font-bold text-sm leading-none"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[9.5px] font-bold text-[#151e17] leading-tight text-right">
                    +3 kg
                    <br />
                    surplus
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column Lot Cards Row */}
            <div className="grid grid-cols-2 gap-2.5 tabular-nums">
              {/* Lot 1: Desi Tamatar (Sitapur) */}
              <div className="bg-white rounded-2xl p-3 border border-[#e1ebe0] shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <img
                      src={HOTLINKED_IMAGES.desiTamatar}
                      alt="Desi Tamatar"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-bold text-[13px] text-[#151e17] leading-tight">
                          Desi Tamatar
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#ecf6eb] text-[#414943] text-[9.5px] font-semibold">
                          Sitapur
                        </span>
                      </div>
                      <span className="text-[10px] text-[#414943] block leading-tight mt-0.5">
                        Supplier: Sitapur Belt #14
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 bg-[#ecf6eb] rounded-xl p-2 text-center mb-2.5">
                    <div>
                      <span className="text-[10px] text-[#414943] block">Demand</span>
                      <span className="text-[12.5px] font-bold text-[#151e17]">48 kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#414943] block">Target</span>
                      <span className="text-[12.5px] font-bold text-[#151e17]">+6.0 kg</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10.5px]">
                  <div>
                    <span className="text-[#414943] block leading-tight">Wholesale Rate</span>
                    <span className="text-[13.5px] font-extrabold text-[#151e17]">
                      ₹28.00<span className="text-[10px] font-normal">/kg</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#414943] block leading-tight">Actual Bought:</span>
                    <span className="font-bold text-[#151e17]">+1 kg surplus</span>
                  </div>
                </div>
              </div>

              {/* Lot 2: Desi Tamatar (Bought & Loaded) */}
              <div className="bg-white rounded-2xl p-3 border border-[#e1ebe0] shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <img
                      src={HOTLINKED_IMAGES.desiTamatar}
                      alt="Desi Tamatar"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-[12.5px] text-[#151e17] truncate">
                          Desi Tamatar
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#e6f1e5] text-[#02341e] text-[9px] font-bold shrink-0">
                          ✓ Bought
                        </span>
                      </div>
                      <span className="text-[10px] text-[#414943] block leading-tight mt-0.5">
                        Sitapur Belt #14
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 bg-[#ecf6eb] rounded-xl p-2 text-center mb-2.5">
                    <div>
                      <span className="text-[10px] text-[#414943] block">Demand</span>
                      <span className="text-[12.5px] font-bold text-[#151e17]">48 kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#414943] block">Target</span>
                      <span className="text-[12.5px] font-bold text-[#151e17]">54 kg</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#414943] block mb-1">Wholesale</span>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center bg-[#e6f1e5] rounded-lg p-1 gap-2">
                      <button
                        onClick={() => setTamatarBought((v) => Math.max(1, v - 1))}
                        className="w-5 h-5 rounded bg-white text-[#151e17] font-bold text-xs"
                      >
                        −
                      </button>
                      <span className="text-[13px] font-extrabold text-[#151e17]">
                        {tamatarBought}
                      </span>
                      <button
                        onClick={() => setTamatarBought((v) => v + 1)}
                        className="w-5 h-5 rounded bg-white text-[#151e17] font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] font-bold text-[#151e17] leading-tight text-right">
                      +{Math.max(0, tamatarBought - 54)} kg
                      <br />
                      surplus
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-Width Lot Card: Desi Kheera */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#e1ebe0] shadow-2xs tabular-nums">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={HOTLINKED_IMAGES.desiKheera}
                    alt="Desi Kheera"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[15px] text-[#151e17]">Desi Kheera</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#ecf6eb] text-[#414943] text-[10.5px] font-semibold">
                        Cucurbit
                      </span>
                    </div>
                    <span className="text-[11.5px] text-[#414943]">
                      Supplier: Sub-Yard Auction
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#e6f1e5] text-[#02341e] text-[10.5px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Bought & Loaded</span>
                </span>
              </div>

              <div className="grid grid-cols-4 bg-[#ecf6eb] rounded-xl p-2 text-center mb-3 text-[11.5px]">
                <div>
                  <span className="text-[10px] text-[#414943] block">Demand</span>
                  <span className="font-bold text-[#151e17]">28 kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#414943] block">Buffer (+10%)</span>
                  <span className="font-bold text-[#151e17]">+3.0 kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#414943] block">Target</span>
                  <span className="font-bold text-[#151e17]">31 kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#414943] block">Crate Lot</span>
                  <span className="font-bold text-[#151e17]">#08-KH</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10.5px] text-[#414943] block leading-tight">
                    Wholesale Rate
                  </span>
                  <span className="text-[15px] font-extrabold text-[#151e17]">
                    ₹24.00<span className="text-[11px] font-normal">/kg</span>
                  </span>
                </div>

                <div className="text-[11px] text-[#414943]">
                  Actual Bought:{' '}
                  <strong className="text-[#151e17]">
                    +{Math.max(0, kheeraBought - 31)} kg surplus
                  </strong>
                </div>

                <div className="flex items-center bg-[#e6f1e5] rounded-xl p-1 gap-2.5">
                  <button
                    onClick={() => setKheeraBought((v) => Math.max(1, v - 1))}
                    className="w-7 h-7 rounded-lg bg-white text-[#151e17] font-bold"
                  >
                    −
                  </button>
                  <span className="text-[14px] font-extrabold text-[#151e17]">{kheeraBought}</span>
                  <button
                    onClick={() => setKheeraBought((v) => v + 1)}
                    className="w-7 h-7 rounded-lg bg-white text-[#151e17] font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Spend & Dispatch Vehicle Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#e1ebe0] shadow-xs tabular-nums">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#414943] block">
                    SPEND COMMITTED
                  </span>
                  <div className="mt-0.5">
                    <span className="text-[20px] font-extrabold text-[#151e17]">₹11,480</span>
                    <span className="text-[12.5px] text-[#414943]"> / ₹14,200 target</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#414943]">#LKO-24-001</span>
                </div>

                <div className="text-right">
                  <span className="text-[10.5px] text-[#414943] block">
                    Society Vehicle Allocation
                  </span>
                  <span className="inline-block mt-1 px-2.5 py-1 rounded-lg bg-[#e6f1e5] text-[#151e17] font-bold text-[11.5px]">
                    Tata Ace #UP32-LN-9921
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast('Weighbridge Slip #WB-9921 logged! Vehicle dispatched to QC Gate.');
                  setTimeout(() => setActiveTab('qc'), 900);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#184d32] hover:bg-[#02341e] text-white font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">receipt_long</span>
                <span>Log Wholesale Weighbridge Slip & Dispatch Vehicle</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* OPS TAB 2: QC & INWARD (6:00 AM Sanitization & Grading)   */}
        {/* ========================================================= */}
        {activeTab === 'qc' && (
          <div className="px-3.5 pt-3 flex flex-col gap-3">
            <div className="bg-[#e3efe2] rounded-2xl p-3.5 border border-[#d2e3d0]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[14.5px] text-[#151e17]">
                  Gate #2 Inward • Dubagga Hub
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0b3b24] text-white text-[10.5px] font-bold">
                  6:00 AM Ozone Bath
                </span>
              </div>
              <p className="text-[12px] text-[#414943]">
                Vehicle Tata Ace #UP32-LN-9921 docked • 285.0 kg gross intake verified
              </p>
            </div>

            {/* INTERACTIVE OZONE SANITIZATION BATH WIDGET */}
            <div className="bg-[#f0f9f3] rounded-2xl p-3.5 border border-[#cbe4d2]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b3b24] text-[20px]">water_drop</span>
                  <span className="font-bold text-[13px] text-[#02341e]">Ozone Wash Chamber #01</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#bdeecd] text-[#002111] text-[10.5px] font-bold">
                  15 ppm O₃ Safe
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#414943]">Sanitization Cycle</span>
                    <span className="font-mono font-bold text-[#02341e]">{ozoneSeconds}s / 180s</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#dbe5da] rounded-full overflow-hidden">
                    <div
                      className="bg-[#0b3b24] h-full transition-all duration-300"
                      style={{ width: `${Math.round(((180 - ozoneSeconds) / 180) * 100)}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (ozoneSeconds <= 0) {
                      setOzoneSeconds(180);
                      showToast('Ozone chamber reset for next Malihabad batch.');
                    } else {
                      setOzoneSeconds(0);
                      showToast('180s Food-grade Ozone cycle complete! 99.9% microbe clearance logged.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#0b3b24] text-white text-[11px] font-bold shrink-0 hover:bg-[#14452b] transition-colors"
                >
                  {ozoneSeconds <= 0 ? 'Reset Wash' : 'Complete 180s'}
                </button>
              </div>
            </div>

            {/* BRIX REFRACTOMETER & CULL LOGGING */}
            <div className="grid grid-cols-2 gap-2.5 tabular-nums">
              <div className="bg-white rounded-2xl p-3 border border-[#e1ebe0]">
                <div className="text-[10px] font-bold uppercase text-[#414943] mb-1">Brix Refractometer</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-extrabold text-[#02341e]">{brixValue}°</span>
                  <span className="text-[11px] font-bold text-[#15803d]">Brix</span>
                </div>
                <span className="text-[10px] text-[#717972] block mt-0.5">Sitapur Tamatar Grade A</span>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => setBrixValue((b) => Math.max(3.0, Math.round((b - 0.2) * 10) / 10))}
                    className="w-6 h-6 rounded bg-[#ecf6eb] text-[#02341e] font-bold text-xs"
                  >
                    −
                  </button>
                  <button
                    onClick={() => setBrixValue((b) => Math.min(8.0, Math.round((b + 0.2) * 10) / 10))}
                    className="w-6 h-6 rounded bg-[#ecf6eb] text-[#02341e] font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-[#e1ebe0]">
                <div className="text-[10px] font-bold uppercase text-[#93000a] mb-1">Cull Reject (Bruised)</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-extrabold text-[#93000a]">{cullQtyKg}</span>
                  <span className="text-[11px] font-bold text-[#93000a]">kg</span>
                </div>
                <span className="text-[10px] text-[#717972] block mt-0.5">Debit Note to Arhatiya</span>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => setCullQtyKg((c) => Math.max(0, Math.round((c - 0.5) * 10) / 10))}
                    className="w-6 h-6 rounded bg-[#fee2e2] text-[#93000a] font-bold text-xs"
                  >
                    −
                  </button>
                  <button
                    onClick={() => {
                      setCullQtyKg((c) => Math.round((c + 0.5) * 10) / 10);
                      showToast(`Rejected +0.5 kg. Credit note #CR-14 updated.`);
                    }}
                    className="w-6 h-6 rounded bg-[#fee2e2] text-[#93000a] font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e1ebe0] shadow-2xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#151e17]">
                  FSSAI & Zero-Wax Sanitization Checklist
                </span>
                <span className="text-[11px] font-bold text-[#02341e]">4/4 Mandatory</span>
              </div>

              {[
                {
                  key: 'ozone',
                  title: 'Food-Grade Ozone Bubble Bath (15 ppm)',
                  sub: 'All leafy greens & surface skins sanitized for 180s',
                },
                {
                  key: 'moisture',
                  title: 'Centrifugal Dew Removal & Air Dry',
                  sub: 'Prevents condensation inside Tower B breathable crates',
                },
                {
                  key: 'brix',
                  title: `Sitapur Tomato Sweetness & Cull (${cullQtyKg} kg)`,
                  sub: `${cullQtyKg} kg bruised tomatoes separated; credit note #CR-14 issued`,
                },
                {
                  key: 'weighbridge',
                  title: 'Master Lot Tare Reconciliation',
                  sub: `Net ${(285.0 - cullQtyKg).toFixed(1)} kg cleared for Station #3 & #4 bin packing`,
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="bg-[#ecf6eb] rounded-xl p-3 flex items-center justify-between gap-2.5 cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-[13px] text-[#151e17] block">{item.title}</span>
                    <span className="text-[11px] text-[#414943]">{item.sub}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={qcChecks[item.key]}
                    onChange={() =>
                      setQcChecks((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                    className="w-5 h-5 accent-[#0b3b24] rounded"
                  />
                </label>
              ))}

              <button
                onClick={() => {
                  showToast('Inward QC Certificate #QC-24-09 signed! Routed to Packing Station #3.');
                  setTimeout(() => setActiveTab('pack'), 800);
                }}
                className="w-full py-3.5 rounded-xl bg-[#0b3b24] text-white font-bold text-[13.5px] flex items-center justify-center gap-2 mt-1"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Release Lots to Packing Stations →</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* OPS TAB 3: PACK (Exact match to Image 10.png)             */}
        {/* ========================================================= */}
        {activeTab === 'pack' && (
          <div className="px-3.5 pt-2.5 flex flex-col gap-3">
            {/* Station #3 Banner */}
            <div className="bg-[#e5efe4] rounded-2xl p-3.5 border border-[#d2e3d0]">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e59b24]" />
                  <span className="font-headline-sm text-[17px] font-bold text-[#151e17]">
                    Station #3 (Tower B)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#14452b] text-white text-[10.5px] font-bold tabular-nums">
                  Shift 6:30 – 8:30 AM
                </span>
              </div>

              <div className="flex items-center justify-between text-[12px] text-[#151e17] mb-2 tabular-nums">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#02341e]">
                    badge
                  </span>
                  <span>
                    Priya Srivastava <strong>(#PK-04)</strong>
                  </span>
                </div>
                <span>
                  <strong>{packedCount}/78</strong> Packed (
                  {Math.round((packedCount / 78) * 100)}%)
                </span>
              </div>

              <div className="w-full h-2 bg-[#cfe0ce] rounded-full overflow-hidden">
                <div
                  className="bg-[#0b3b24] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((packedCount / 78) * 100))}%` }}
                />
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setPackQueueFilter('pending')}
                className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold shrink-0 transition-colors ${
                  packQueueFilter === 'pending'
                    ? 'bg-[#0b3b24] text-white'
                    : 'bg-[#e6f1e5] text-[#414943]'
                }`}
              >
                Pending ({Math.max(0, 78 - packedCount)})
              </button>

              <button
                onClick={() => setPackQueueFilter('in-progress')}
                className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold flex items-center gap-1.5 shrink-0 transition-colors ${
                  packQueueFilter === 'in-progress'
                    ? 'bg-[#0b3b24] text-white'
                    : 'bg-[#e6f1e5] text-[#414943]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#e59b24]" />
                <span>In-Progress (1)</span>
              </button>

              <button
                onClick={() => setPackQueueFilter('shortage')}
                className="px-3 py-1.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11.5px] font-bold flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Shortage Review (3)</span>
              </button>
            </div>

            {/* Active Crate Packing Card (#AM-84920) */}
            <div className="bg-white rounded-3xl p-4 border border-[#e1ebe0] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-[19px] font-extrabold text-[#151e17] font-mono">
                    {activeCrateId}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#e6f1e5] text-[#151e17] text-[11px] font-bold">
                    Tower B • 402
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-[#ffddb5] text-[#643f00] text-[11px] font-bold">
                  Eldeco Elegance
                </span>
              </div>

              <div className="flex items-center justify-between text-[12.5px] text-[#151e17]">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="material-symbols-outlined text-[16px] text-[#835400]">
                    person_pin
                  </span>
                  <span>Aditi Sharma</span>
                </div>
                <div className="flex items-center gap-1 text-[11.5px] text-[#414943] tabular-nums">
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  <span>8:30 AM – 9:30 AM</span>
                </div>
              </div>

              {/* Linked Batch Crate Bar */}
              <div className="bg-[#eaf3e9] rounded-2xl p-3 flex items-center justify-between gap-2 border border-[#d6e5d5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#cfe6d4] text-[#02341e] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">
                      assignment_turned_in
                    </span>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#414943] block">Linked Batch Crate</span>
                    <span className="font-mono font-extrabold text-[13.5px] text-[#151e17]">
                      #CRATE-TB-402
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Crate #CRATE-TB-402 RFID & QR barcode verified!')}
                  className="px-3 py-1.5 rounded-xl bg-[#dce9db] hover:bg-[#cfe0ce] text-[#151e17] font-bold text-[11.5px] flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                  <span>Re-Scan</span>
                </button>
              </div>

              {/* Free Society Perk Attached */}
              <div className="bg-[#fff4e4] rounded-2xl p-3 flex items-center justify-between gap-2 border border-[#f5e1c3]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#835400] text-[19px]">eco</span>
                  <div>
                    <span className="text-[12px] font-bold text-[#643f00] block">
                      Free Society Perk Attached
                    </span>
                    <span className="text-[11px] text-[#414943]">
                      Tier 1 Dhaniya-Mirchi Guarantee Bundle
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#e59b24] text-[#151e17] text-[10px] font-extrabold">
                  FREE
                </span>
              </div>

              {/* ASSIGNED PRODUCE HEADER */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#151e17]">
                  ASSIGNED PRODUCE (4 ITEMS)
                </span>
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#414943] text-right">
                  BLUETOOTH SCALE
                  <br />
                  SYNCED
                </span>
              </div>

              {/* 4 PRODUCE WEIGH ROWS */}
              <div className="flex flex-col gap-2.5 tabular-nums">
                {/* Item 1: Pahadi Aloo */}
                <div
                  onClick={() => togglePackItem('aloo')}
                  className="bg-[#ebf4ea] rounded-2xl p-2.5 flex items-center justify-between gap-2.5 cursor-pointer border border-transparent hover:border-[#02341e]/20 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={HOTLINKED_IMAGES.pahadiAloo}
                      alt="Pahadi Aloo"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-[14px] text-[#151e17] block">
                        Pahadi Aloo
                      </span>
                      <span className="text-[11px] text-[#414943] block">Req: 2.00 kg</span>
                      <span className="text-[11px] font-bold text-[#02341e]">
                        Scaled: 2.04 kg (+2.0%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-[#cde8d4] text-[#02341e] text-[10.5px] font-bold">
                      In Range
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        checkedItems.aloo
                          ? 'bg-[#0b3b24] text-white'
                          : 'bg-white text-[#717972] border border-[#c1c9c0]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                  </div>
                </div>

                {/* Item 2: Desi Tamatar */}
                <div
                  onClick={() => togglePackItem('tamatar')}
                  className="bg-[#ebf4ea] rounded-2xl p-2.5 flex items-center justify-between gap-2.5 cursor-pointer border border-transparent hover:border-[#02341e]/20 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={HOTLINKED_IMAGES.desiTamatar}
                      alt="Desi Tamatar"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-[14px] text-[#151e17] block">
                        Desi Tamatar
                      </span>
                      <span className="text-[11px] text-[#414943] block">Req: 1.00 kg</span>
                      <span className="text-[11px] font-bold text-[#02341e]">
                        Scaled: 0.98 kg (-2.0%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-[#cde8d4] text-[#02341e] text-[10.5px] font-bold">
                      In Range
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        checkedItems.tamatar
                          ? 'bg-[#0b3b24] text-white'
                          : 'bg-white text-[#717972] border border-[#c1c9c0]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                  </div>
                </div>

                {/* Item 3: Lucknow Palak */}
                <div
                  onClick={() => togglePackItem('palak')}
                  className="bg-[#ebf4ea] rounded-2xl p-2.5 flex items-center justify-between gap-2.5 cursor-pointer border border-transparent hover:border-[#02341e]/20 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={HOTLINKED_IMAGES.lucknowPalak}
                      alt="Lucknow Palak"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-[14px] text-[#151e17] block">
                        Lucknow Palak
                      </span>
                      <span className="text-[11px] text-[#414943] block">
                        Req: 2 bunches (500g)
                      </span>
                      <span className="text-[11px] font-bold text-[#02341e]">
                        Scanned: 2 bunches (510g)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-[#cde8d4] text-[#02341e] text-[10.5px] font-bold">
                      Bundled
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        checkedItems.palak
                          ? 'bg-[#0b3b24] text-white'
                          : 'bg-white text-[#717972] border border-[#c1c9c0]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                  </div>
                </div>

                {/* Item 4: Chilli & Coriander Combo */}
                <div
                  onClick={() => togglePackItem('combo')}
                  className="bg-[#ebf4ea] rounded-2xl p-2.5 flex items-center justify-between gap-2.5 cursor-pointer border border-transparent hover:border-[#02341e]/20 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#c8e4d0] text-[#02341e] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">nutrition</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[14px] text-[#151e17] block leading-snug">
                        Chilli & Coriander
                        <br />
                        Combo
                      </span>
                      <span className="text-[11px] text-[#414943] block">Req: 1 pack (100g)</span>
                      <span className="text-[11px] font-bold text-[#02341e]">
                        Barcoded: 1 pack (Verified)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-[#cde8d4] text-[#02341e] text-[10.5px] font-bold">
                      Scanned
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        checkedItems.combo
                          ? 'bg-[#0b3b24] text-white'
                          : 'bg-white text-[#717972] border border-[#c1c9c0]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Reconciliation Ledger */}
              <div className="bg-[#dfeae0] rounded-2xl p-3 tabular-nums">
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-semibold text-[#151e17]">
                    Weight Reconciliation
                    <br />
                    Ledger
                  </span>
                  <span className="font-bold text-[#02341e] text-right">
                    ±3% Mandi Tolerance
                    <br />
                    Compliant
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-xl p-2">
                    <span className="text-[10px] text-[#414943] block">Requested</span>
                    <span className="text-[15px] font-extrabold text-[#151e17]">3.60 kg</span>
                  </div>
                  <div className="bg-white rounded-xl p-2">
                    <span className="text-[10px] text-[#414943] block">Live Scale</span>
                    <span className="text-[15px] font-extrabold text-[#02341e]">3.63 kg</span>
                  </div>
                  <div className="bg-white rounded-xl p-2">
                    <span className="text-[10px] text-[#414943] block">Paise Diff</span>
                    <span className="text-[15px] font-extrabold text-[#835400]">₹0.00</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  showToast(
                    'Shortage/Damage modal logged: Auto-refund rule stands by if net weight drops >50g.'
                  )
                }
                className="w-full py-2.5 rounded-xl bg-[#e8f0e7] hover:bg-[#dbe5da] text-[#151e17] font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#93000a]">
                  warning
                </span>
                <span>Log Produce Shortage / Damaged Leaf</span>
              </button>
            </div>

            {/* Bottom Print QR & Seal Bag Card */}
            <div className="bg-white rounded-3xl p-3.5 border border-[#e1ebe0] shadow-xs">
              <div className="flex items-center justify-between text-[11.5px] mb-2.5">
                <span className="text-[#414943]">
                  Next In Line: <strong>#AM-84921 (Tower B - 405)</strong>
                </span>
                <span className="font-bold text-[#02341e] text-right">
                  {allFourChecked ? 'All 4 Checkmarks Ready' : 'Verify all items'}
                </span>
              </div>

              <button
                onClick={() => {
                  setPackedCount((c) => Math.min(78, c + 1));
                  setActiveCrateId('#AM-84921');
                  showToast('Printed thermal QR label & sealed #CRATE-TB-402! Loaded onto Trolley #02.');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#07361f] hover:bg-[#14452b] text-white font-bold text-[14.5px] flex items-center justify-between shadow-md transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">print</span>
                <span className="text-center leading-tight">
                  Print QR & Seal Bag #CRATE-
                  <br />
                  TB-402
                </span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* OPS TAB 4: DELIVER (Exact match to Image 16.png)          */}
        {/* ========================================================= */}
        {activeTab === 'deliver' && (
          <div className="px-3.5 pt-2.5 flex flex-col gap-3">
            {/* Rider & Trolley Card */}
            <div className="bg-[#ebf4ea] rounded-2xl p-3.5 border border-[#d6e5d5]">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#0b3b24] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px] text-[#151e17] leading-tight">
                        Sandeep Rawat
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#dce6db] text-[#151e17] font-mono text-[10.5px] font-bold">
                        #ELD-8824
                      </span>
                    </div>
                    <span className="text-[12px] text-[#414943] block mt-0.5">
                      Trolley #02 • Eldeco Elegance Ph-2
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#bdeecd] text-[#002111] text-[11px] font-bold flex items-center gap-1 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#02341e]" />
                  <span>Route Active</span>
                </span>
              </div>

              <div className="bg-[#e1ece0] rounded-xl px-3 py-2 flex items-center gap-2 text-[11.5px] text-[#151e17]">
                <span className="material-symbols-outlined text-[16px] text-[#02341e]">
                  verified_user
                </span>
                <span className="truncate">
                  Security Pass Active: Tower B Lift & Entry Pre-cleared
                </span>
              </div>
            </div>

            {/* TOWER B LIFT SEQUENCE */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#e1ebe0] shadow-2xs tabular-nums">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#835400] block">
                    TOWER B LIFT SEQUENCE
                  </span>
                  <h2 className="font-headline-sm text-[19px] font-extrabold text-[#151e17]">
                    Floor 4 of 14 Delivery
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-[20px] font-extrabold text-[#02341e]">
                    {deliveredStops}
                  </span>
                  <span className="text-[14px] text-[#717972]">/28</span>
                  <span className="text-[10.5px] text-[#414943] block">Drops Done</span>
                </div>
              </div>

              {/* Segmented Progress Bar */}
              <div className="w-full h-2 bg-[#e6f1e5] rounded-full overflow-hidden flex gap-0.5 mb-3">
                <div className="bg-[#0b3b24] h-full" style={{ width: '68%' }} />
                <div className="bg-[#e59b24] h-full" style={{ width: '5%' }} />
                <div className="bg-[#93000a] h-full" style={{ width: '5%' }} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#ecf6eb] rounded-xl p-2">
                  <span className="text-[16px] font-extrabold text-[#02341e] block">
                    {deliveredStops}
                  </span>
                  <span className="text-[11px] text-[#414943]">Delivered</span>
                </div>
                <div className="bg-[#ecf6eb] rounded-xl p-2">
                  <span className="text-[16px] font-extrabold text-[#835400] block">
                    {pendingStops}
                  </span>
                  <span className="text-[11px] text-[#414943]">Pending</span>
                </div>
                <div className="bg-[#ecf6eb] rounded-xl p-2">
                  <span className="text-[16px] font-extrabold text-[#93000a] block">1</span>
                  <span className="text-[11px] text-[#93000a] font-medium">Exception</span>
                </div>
              </div>
            </div>

            {/* CURRENT STOP • #20 CARD */}
            <div className="bg-white rounded-3xl p-4 border-t-4 border-[#0b3b24] shadow-sm flex flex-col gap-3 tabular-nums">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2.5 py-1 rounded-full bg-[#0b3b24] text-white text-[10.5px] font-extrabold uppercase">
                  CURRENT STOP • #20
                </span>
                <span className="text-[11.5px] font-bold text-[#835400]">Lift Bay Level 4</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#bdeecd] text-[#002111] text-[10.5px] font-bold">
                  Prepaid UPI
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="font-headline-sm text-[20px] font-extrabold text-[#151e17]">
                    Tower B - Flat 402
                  </h3>
                  <span className="text-[12.5px] text-[#414943]">
                    Aditi Sharma • <strong className="text-[#151e17]">Order #AM-84920</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[19px] font-extrabold text-[#02341e] block">₹153.00</span>
                  <span className="text-[11px] text-[#414943]">1 Eco-Bag (3.63 kg)</span>
                </div>
              </div>

              {/* Doorstep Instruction Box */}
              <div className="bg-[#ffefd6] rounded-2xl p-3 flex items-start gap-2.5 border border-[#f5dfc0]">
                <span className="material-symbols-outlined text-[#835400] text-[19px] mt-0.5">
                  home
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#835400] block">
                    DOORSTEP INSTRUCTION
                  </span>
                  <span className="text-[13px] font-bold text-[#2a1800]">
                    Leave bag at doorstep shoe rack / Ring bell once
                  </span>
                </div>
              </div>

              {/* Crate Lot Contents */}
              <div className="bg-[#ecf6eb] rounded-xl p-2.5 flex items-center gap-2 text-[11.5px] text-[#151e17]">
                <span className="material-symbols-outlined text-[#02341e] text-[17px]">eco</span>
                <span>
                  Crate Lot #04-B: Desi Palak (500g), Chausa Mangoes (2kg), Safeda (1.1kg)
                </span>
              </div>

              {/* Snap Drop Photo & Confirm Drop Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setPhotoSnapped(true);
                    showToast('Doorstep proof photo captured & attached to #AM-84920!');
                  }}
                  className="py-3 px-3 rounded-xl bg-[#e6f1e5] hover:bg-[#dbe5da] text-[#151e17] font-bold text-[12.5px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  <span>{photoSnapped ? 'Photo Saved ✓' : 'Snap Drop Photo'}</span>
                </button>

                <button
                  onClick={() => {
                    setDeliveredStops((d) => Math.min(28, d + 1));
                    setPendingStops((p) => Math.max(0, p - 1));
                    showToast('Flat 402 drop confirmed! WhatsApp receipt & photo sent to Aditi.');
                  }}
                  className="py-3 px-3 rounded-xl bg-[#07361f] hover:bg-[#14452b] text-white font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Confirm Drop</span>
                </button>
              </div>
            </div>

            {/* Next Stops in Tower B */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="font-bold text-[15px] text-[#151e17]">Next Stops in Tower B</h3>
              <span className="text-[11.5px] font-semibold text-[#02341e]">Optimal Lift Path</span>
            </div>

            {/* Stop #21 */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#e1ebe0] shadow-2xs flex flex-col gap-2 tabular-nums">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#e6f1e5] text-[#151e17] text-[11px] font-bold">
                    Stop #21
                  </span>
                  <span className="text-[11.5px] text-[#414943]">Floor 4</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffddb5] text-[#643f00] text-[10.5px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">payments</span>
                  <span>Pay at Door</span>
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <h4 className="font-bold text-[16px] text-[#151e17]">Tower B – Flat 405</h4>
                  <span className="text-[12px] text-[#414943]">
                    Sunil Bajpai • Order #AM-84921
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[16px] font-extrabold text-[#835400] block">₹245.00</span>
                  <span className="text-[11px] text-[#414943]">2 Bags (6.2 kg)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#f2fcf1]">
                <span className="text-[#414943] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#835400]">
                    qr_code
                  </span>
                  Ready with Doorstep UPI QR / Cash
                </span>
                <span className="font-bold text-[#02341e]">12m walk from #402</span>
              </div>
            </div>

            {/* Stop #22 */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#e1ebe0] shadow-2xs flex flex-col gap-2 tabular-nums">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#e6f1e5] text-[#151e17] text-[11px] font-bold">
                    Stop #22
                  </span>
                  <span className="text-[11.5px] text-[#414943]">Floor 5 (Take Lift)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#bdeecd] text-[#002111] text-[10.5px] font-bold">
                  Prepaid
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <h4 className="font-bold text-[16px] text-[#151e17]">Tower B – Flat 501</h4>
                  <span className="text-[12px] text-[#414943]">
                    Meera Gupta • Order #AM-84924
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[16px] font-extrabold text-[#151e17] block">₹89.00</span>
                  <span className="text-[11px] text-[#414943]">1 Bag (2.1 kg)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#f2fcf1]">
                <span className="text-[#414943]">Instruction: Contactless drop</span>
                <span className="px-2 py-0.5 rounded bg-[#ecf6eb] text-[#414943] font-semibold">
                  Queued
                </span>
              </div>
            </div>

            {/* DELIVERY EXCEPTION LOGGED */}
            <div className="bg-[#ffece9] rounded-2xl p-3.5 border border-[#ffdad6]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-[#93000a] text-[11px] font-extrabold uppercase">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>DELIVERY EXCEPTION LOGGED</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-[#93000a] text-[10.5px] font-bold">
                  Stop #14 (Passed)
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-[15px] text-[#93000a]">Tower B – Flat 204</h4>
                  <span className="text-[11.5px] text-[#93000a]">
                    Order #AM-84912 • Rahul Verma
                  </span>
                </div>
                <button
                  onClick={() => showToast('Dialing Tower B Guard Intercom #204...')}
                  className="px-3 py-1.5 rounded-lg bg-white text-[#93000a] font-bold text-[11.5px] flex items-center gap-1 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  <span>Intercom</span>
                </button>
              </div>

              <div className="bg-white rounded-xl p-2.5 text-[11.5px] text-[#414943] leading-relaxed">
                <strong className="text-[#93000a] block">
                  Reason: Door Locked & Intercom Unreachable
                </strong>
                Action Taken: Society Security Guard notified; produce held at Tower B Ground Lobby
                desk for resident retrieval.
              </div>
            </div>

            {/* Tower B Service Route Layout */}
            <div className="bg-[#eaf3e9] rounded-2xl p-3.5 border border-[#d6e5d5]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-[13.5px] text-[#151e17]">
                  Tower B Service Route Layout
                </span>
                <span className="text-[11px] font-bold text-[#835400]">Gate Sync Active</span>
              </div>

              <div className="flex items-center justify-between text-center text-[10.5px]">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#0b3b24] text-white font-bold flex items-center justify-center mb-1">
                    G
                  </div>
                  <span className="text-[#414943]">Lobby</span>
                </div>
                <div className="h-0.5 flex-1 bg-[#0b3b24] mx-1 -mt-4" />
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#0b3b24] text-white font-bold flex items-center justify-center mb-1">
                    F2
                  </div>
                  <span className="text-[#414943]">14 Done</span>
                </div>
                <div className="h-0.5 flex-1 bg-[#0b3b24] mx-1 -mt-4" />
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-[#f4a62a] text-[#151e17] font-extrabold ring-2 ring-[#151e17] flex items-center justify-center mb-1">
                    F4
                  </div>
                  <span className="font-bold text-[#151e17]">Current</span>
                </div>
                <div className="h-0.5 flex-1 bg-[#c1c9c0] mx-1 -mt-4" />
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white text-[#414943] font-bold border border-[#c1c9c0] flex items-center justify-center mb-1">
                    F5
                  </div>
                  <span className="text-[#414943]">Next</span>
                </div>
                <div className="h-0.5 flex-1 bg-[#c1c9c0] mx-1 -mt-4" />
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white text-[#414943] font-bold border border-[#c1c9c0] flex items-center justify-center mb-1">
                    F14
                  </div>
                  <span className="text-[#414943]">End</span>
                </div>
              </div>
            </div>

            {/* Bottom Active Stop Sticky Strip */}
            <div className="bg-white rounded-2xl p-3 border border-[#dbe5da] shadow-md flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e59b24]" />
                  <span className="text-[10.5px] font-extrabold uppercase text-[#151e17]">
                    FLAT 402 ACTIVE
                  </span>
                </div>
                <span className="font-bold text-[14px] text-[#151e17] truncate block tabular-nums">
                  Aditi Sharma • ₹153
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setPhotoSnapped(true);
                    showToast('Doorstep photo saved!');
                  }}
                  className="w-10 h-10 rounded-xl bg-[#ecf6eb] text-[#151e17] flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[19px]">photo_camera</span>
                </button>
                <button
                  onClick={() => {
                    setDeliveredStops((d) => Math.min(28, d + 1));
                    setPendingStops((p) => Math.max(0, p - 1));
                    showToast('Completed Stop #20 (Flat 402)! Moving to Stop #21 (Flat 405).');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#07361f] hover:bg-[#14452b] text-white font-bold text-[13px] flex items-center gap-1.5"
                >
                  <span>Complete Stop</span>
                  <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM OPS NAVIGATION BAR */}
      <nav className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#e1ebe0] px-3 py-2 grid grid-cols-4 z-30">
        <button
          onClick={() => setActiveTab('procure')}
          className={`flex flex-col items-center gap-0.5 py-1 rounded-xl transition-colors ${
            activeTab === 'procure' ? 'text-[#02341e] font-bold' : 'text-[#414943]'
          }`}
        >
          <span className="material-symbols-outlined text-[21px]">inventory_2</span>
          <span className="text-[11px]">Procure</span>
        </button>

        <button
          onClick={() => setActiveTab('qc')}
          className={`flex flex-col items-center gap-0.5 py-1 rounded-xl transition-colors ${
            activeTab === 'qc' ? 'text-[#02341e] font-bold' : 'text-[#414943]'
          }`}
        >
          <span className="material-symbols-outlined text-[21px]">verified</span>
          <span className="text-[11px]">QC & Inward</span>
        </button>

        <button
          onClick={() => setActiveTab('pack')}
          className={`flex flex-col items-center gap-0.5 py-1 rounded-xl transition-colors ${
            activeTab === 'pack' ? 'text-[#02341e] font-bold' : 'text-[#414943]'
          }`}
        >
          <span className="material-symbols-outlined text-[21px]">deployed_code</span>
          <span className="text-[11px]">Pack</span>
        </button>

        <button
          onClick={() => setActiveTab('deliver')}
          className={`flex flex-col items-center gap-0.5 py-1 rounded-xl transition-colors ${
            activeTab === 'deliver' ? 'text-[#02341e] font-bold' : 'text-[#414943]'
          }`}
        >
          <span className="material-symbols-outlined text-[21px]">local_shipping</span>
          <span className="text-[11px]">Deliver</span>
        </button>
      </nav>

      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#151e17] text-white px-4 py-2.5 rounded-xl shadow-xl text-[12px] font-semibold flex items-center gap-2 z-50 max-w-xs text-center">
          <span className="material-symbols-outlined text-[16px] text-[#bdeecd]">task_alt</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
