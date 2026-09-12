import { Select, Option, Modal, ModalHeader, ModalBody } from "jimu-ui";
import {
  filterButtonStyle,
  filterButtonLabelStyle,
  filterButtonSubtitleStyle,
  filterContainerStyle,
  fieldStyle,
  fieldLabelStyle,
  contextChipsStyle,
  contextChipStyle,
  noMapsMessageStyle,
  modalDialogStyle,
  MODAL_BELOW_HEADER_CLASS,
  modalBelowHeaderCss,
} from "../style";

type LayerFilterModalProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  regions: string[];
  provinces: string[];
  lcMapNumbers: string[];
  selectedRegion: string;
  selectedProvince: string;
  selectedLcNumber: string;
  onRegionChange: (region: string) => void;
  onProvinceChange: (province: string) => void;
  onLcNumberChange: (lcNumber: string) => void;
};

// The button that opens the filter, plus the filter popup itself (a
// read-only Region/Province line and the LC Map Number select). Purely
// presentational -- all of the map/layer work happens in the change
// handlers passed down from widget.tsx.
export function LayerFilterModal({
  isOpen,
  onOpen,
  onClose,
  regions,
  provinces,
  lcMapNumbers,
  selectedRegion,
  selectedProvince,
  selectedLcNumber,
  onRegionChange,
  onProvinceChange,
  onLcNumberChange,
}: LayerFilterModalProps) {
  return (
    <>
      <button
        type="button"
        css={filterButtonStyle}
        className="jimu-widget"
        onClick={onOpen}
      >
        <span css={filterButtonLabelStyle}>Choose a Layer</span>
        {selectedLcNumber && (
          <span css={filterButtonSubtitleStyle}>
            {selectedRegion} &middot; {selectedProvince} &middot;{" "}
            {selectedLcNumber}
          </span>
        )}
      </button>

      <style>{modalBelowHeaderCss}</style>

      <Modal
        isOpen={isOpen}
        toggle={onClose}
        centered
        css={modalDialogStyle}
        modalClassName={MODAL_BELOW_HEADER_CLASS}
      >
        <ModalHeader toggle={onClose}>Choose a Layer</ModalHeader>
        <ModalBody>
          {/* Region and Province are picked from the sidebar now (see
              forestland-menu's Region -> Province browser), not here -- this
              popup only needs to ask for the LC Map Number, plus a read-only
              line confirming what the sidebar handed off. selectedRegion/
              selectedProvince (and the regions/provinces lists, and
              onRegionChange/onProvinceChange) are still accepted as props:
              widget.tsx still needs that state for loading the right layer
              and filtering comments. */}
          <div css={filterContainerStyle}>
            {selectedRegion && (
              <div css={contextChipsStyle}>
                <span css={contextChipStyle}>{selectedRegion}</span>
                {selectedProvince && (
                  <span css={contextChipStyle}>{selectedProvince}</span>
                )}
              </div>
            )}

            <div css={fieldStyle}>
              <label css={fieldLabelStyle}>LC Map Number</label>

              {selectedProvince && lcMapNumbers.length === 0 ? (
                <span css={noMapsMessageStyle}>
                  No LC Map has been published for this province yet.
                </span>
              ) : (
                <Select
                  value={selectedLcNumber}
                  disabled={!selectedRegion}
                  onChange={(e) => onLcNumberChange(e.target.value)}
                  placeholder="Select a LC Map Number"
                >
                  {lcMapNumbers.map((number) => (
                    <Option key={number} value={number}>
                      {number}
                    </Option>
                  ))}
                </Select>
              )}
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
