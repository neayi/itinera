import svgPaths from "./svg-cgu02akydt";
import imgColorLayer from "figma:asset/ba9dfa87db6f55066938ccc441081c1698225634.png";

function CheckBoxOutlineBlank() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="check_box_outline_blank">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="check_box_outline_blank">
          <path d={svgPaths.p12c0c180} fill="var(--fill-0, #707070)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Cell() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[48px]" data-name="Cell">
      <CheckBoxOutlineBlank />
    </div>
  );
}

function TextTyping() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Text + Typing">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#212121] text-[14px] text-nowrap text-right whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        1 234
      </p>
    </div>
  );
}

function Cell1() {
  return (
    <div className="bg-[#ebf7ff] content-stretch flex h-[48px] items-center justify-end px-[16px] py-0 relative shrink-0 w-[110px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-[-0.5px] pointer-events-none" />
      <TextTyping />
    </div>
  );
}

function TextTyping1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Text + Typing">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#212121] text-[14px] text-nowrap text-right whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        1 234
      </p>
    </div>
  );
}

function Cell2() {
  return (
    <div className="bg-[#e9edfd] content-stretch flex h-[48px] items-center justify-end px-[16px] py-0 relative shrink-0 w-[110px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-[-0.5px] pointer-events-none" />
      <TextTyping1 />
    </div>
  );
}

function Cell3() {
  return (
    <div className="bg-[#e3e8fc] content-stretch flex h-[48px] items-center justify-end px-[16px] py-0 relative shrink-0 w-[140px]" data-name="Cell">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#212121] text-[14px] text-nowrap text-right whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        1 234
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-[rgba(74,106,212,0.2)] content-stretch flex flex-col items-start pl-[4px] pr-0 py-0 relative shrink-0">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#212121] text-[14px] text-nowrap text-right whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        1 234
      </p>
    </div>
  );
}

function CursorTypingGif() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-[4px]" data-name="Cursor/Typing (GIF)">
      <div className="absolute bg-[#295eff] inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-10px_2px] mask-size-[24px_20px]" data-name="Color layer" style={{ maskImage: `url('${imgColorLayer}')` }} />
    </div>
  );
}

function Cell4() {
  return (
    <div className="bg-[#e3e8fc] content-stretch flex h-[48px] items-center justify-end px-[16px] py-0 relative shrink-0 w-[80px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border-2 border-[#4a6ad4] border-solid inset-0 pointer-events-none" />
      <Frame />
      <CursorTypingGif />
    </div>
  );
}

function TextTyping2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Text + Typing">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#212121] text-[14px] text-nowrap text-right whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        1 234
      </p>
    </div>
  );
}

function Cell5() {
  return (
    <div className="bg-[#ebf7ff] content-stretch flex h-[48px] items-center justify-end px-[16px] py-0 relative shrink-0 w-[140px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-[-0.5px] pointer-events-none" />
      <TextTyping2 />
    </div>
  );
}

function CellFill() {
  return (
    <div className="basis-0 bg-white grow h-[48px] min-h-px min-w-px relative shrink-0" data-name="Cell - FILL">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative size-full">
          <p className="font-['Roboto:Regular',sans-serif] font-normal h-[24px] leading-[24px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#212121] text-[14px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
            &nbsp;
          </p>
        </div>
      </div>
    </div>
  );
}

function RowViewMode() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Row - View mode">
      <Cell />
      <Cell1 />
      <Cell2 />
      <Cell3 />
      <Cell4 />
      {[...Array(4).keys()].map((_, i) => (
        <Cell5 key={i} />
      ))}
      <CellFill />
    </div>
  );
}

function CheckBoxOutlineBlank1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="check_box_outline_blank">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="check_box_outline_blank">
          <path d={svgPaths.p12c0c180} fill="var(--fill-0, #707070)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Cell6() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center relative shrink-0 size-[48px]" data-name="Cell">
      <CheckBoxOutlineBlank1 />
    </div>
  );
}

function TextTyping3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Text + Typing">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#212121] text-[14px] text-nowrap text-right whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        1 234
      </p>
    </div>
  );
}

function Cell7() {
  return (
    <div className="bg-[#ebf7ff] content-stretch flex h-[48px] items-center justify-end px-[16px] py-0 relative shrink-0 w-[110px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-[-0.5px] pointer-events-none" />
      <TextTyping3 />
    </div>
  );
}

function TextTyping4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Text + Typing">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#212121] text-[14px] text-nowrap text-right whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        1 234
      </p>
    </div>
  );
}

function Cell8() {
  return (
    <div className="bg-[#ebf7ff] content-stretch flex h-[48px] items-center justify-end px-[16px] py-0 relative shrink-0 w-[140px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-[-0.5px] pointer-events-none" />
      <TextTyping4 />
    </div>
  );
}

function TextTyping5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Text + Typing">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#212121] text-[14px] text-nowrap text-right whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        1 234
      </p>
    </div>
  );
}

function Cell9() {
  return (
    <div className="bg-[#ebf7ff] content-stretch flex h-[48px] items-center justify-end px-[16px] py-0 relative shrink-0 w-[80px]" data-name="Cell">
      <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-[-0.5px] pointer-events-none" />
      <TextTyping5 />
    </div>
  );
}

function CellFill1() {
  return (
    <div className="basis-0 bg-white grow h-[48px] min-h-px min-w-px relative shrink-0" data-name="Cell - FILL">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[16px] py-0 relative size-full">
          <p className="font-['Roboto:Regular',sans-serif] font-normal h-[24px] leading-[24px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#212121] text-[14px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
            &nbsp;
          </p>
        </div>
      </div>
    </div>
  );
}

function RowViewMode1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Row - View mode">
      <Cell6 />
      {[...Array(2).keys()].map((_, i) => (
        <Cell7 key={i} />
      ))}
      <Cell8 />
      <Cell9 />
      <Cell8 />
      <Cell8 />
      <Cell8 />
      <Cell8 />
      <CellFill1 />
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      <RowViewMode />
      {[...Array(5).keys()].map((_, i) => (
        <RowViewMode1 key={i} />
      ))}
    </div>
  );
}