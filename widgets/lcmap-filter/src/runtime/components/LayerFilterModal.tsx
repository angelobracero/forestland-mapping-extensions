import { Select, Option, Modal, ModalHeader, ModalBody } from "jimu-ui";
import {
  filterButtonStyle,
  filterButtonLabelStyle,
  filterButtonSubtitleStyle,
  filterContainerStyle,
  fieldStyle,
  fieldLabelStyle,
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

// The button that opens the filter, plus the filter popup itself (Region /
// Province / LC Map Number selects). Purely presentational -- all of the
// map/layer work happens in the change handlers passed down from widget.tsx.
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
          <div css={filterContainerStyle}>
            <div css={fieldStyle}>
              <label css={fieldLabelStyle}>Region</label>

              <Select
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                placeholder="Select a Region"
              >
                {regions.map((region) => (
                  <Option key={region} value={region}>
                    {region}
                  </Option>
                ))}
              </Select>
            </div>

            <div css={fieldStyle}>
              <label css={fieldLabelStyle}>Province</label>

              <Select
                value={selectedProvince}
                disabled={!selectedRegion}
                onChange={(e) => onProvinceChange(e.target.value)}
                placeholder="Select a Province"
              >
                {provinces.map((province) => (
                  <Option key={province} value={province}>
                    {province}
                  </Option>
                ))}
              </Select>
            </div>

            <div css={fieldStyle}>
              <label css={fieldLabelStyle}>LC Map Number</label>

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
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
