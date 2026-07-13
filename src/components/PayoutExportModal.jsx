import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FiChevronDown, FiX, FiDownload } from 'react-icons/fi';
import { PAYOUT_COLUMN_GROUPS, getGroupLeafKeys, getAllLeafKeys, buildExportRow } from '../utils/payoutExport';
import { downloadCSV } from '../utils/csv';
import './PayoutExportModal.css';

const ALL_LEAF_KEYS = getAllLeafKeys();
const PREVIEW_LIMIT = 8;

function GroupCheckbox({ checked, indeterminate, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      type="checkbox"
      className="column-checkbox"
      ref={ref}
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

function PayoutExportModal({ isOpen, onClose, records, calculateDaysAgo }) {
  const [selectedKeys, setSelectedKeys] = useState(() => new Set(ALL_LEAF_KEYS));
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!panelOpen) return;
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [panelOpen]);

  const exportRows = useMemo(
    () => records.map((r) => buildExportRow(r, calculateDaysAgo)),
    [records, calculateDaysAgo]
  );

  if (!isOpen) return null;

  const isGroupFullySelected = (group) => {
    const keys = getGroupLeafKeys(group);
    return keys.every((k) => selectedKeys.has(k));
  };

  const isGroupPartiallySelected = (group) => {
    const keys = getGroupLeafKeys(group);
    const selectedCount = keys.filter((k) => selectedKeys.has(k)).length;
    return selectedCount > 0 && selectedCount < keys.length;
  };

  const toggleGroup = (group) => {
    const keys = getGroupLeafKeys(group);
    const shouldSelectAll = !isGroupFullySelected(group);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (shouldSelectAll ? next.add(k) : next.delete(k)));
      return next;
    });
  };

  const toggleLeaf = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleGroups = PAYOUT_COLUMN_GROUPS
    .map((group) => ({
      ...group,
      children: group.children ? group.children.filter((c) => selectedKeys.has(c.key)) : null,
    }))
    .filter((group) => (group.children ? group.children.length > 0 : selectedKeys.has(group.key)));

  const totalSelectedColumns = visibleGroups.reduce(
    (sum, g) => sum + (g.children ? g.children.length : 1),
    0
  );

  const previewRows = exportRows.slice(0, PREVIEW_LIMIT);

  const handleDownload = () => {
    if (totalSelectedColumns === 0) return;

    const headerRow1 = [];
    const headerRow2 = [];
    visibleGroups.forEach((group) => {
      if (group.children) {
        group.children.forEach((child, idx) => {
          headerRow1.push(idx === 0 ? group.label : '');
          headerRow2.push(child.label);
        });
      } else {
        headerRow1.push(group.label);
        headerRow2.push(group.label);
      }
    });

    const dataRows = exportRows.map((row) => {
      const cells = [];
      visibleGroups.forEach((group) => {
        const keys = group.children ? group.children.map((c) => c.key) : [group.key];
        keys.forEach((k) => cells.push(row[k]));
      });
      return cells;
    });

    downloadCSV('referral-payouts.csv', [headerRow1, headerRow2, ...dataRows]);
  };

  return (
    <div
      className="payout-export-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="payout-export-modal">
        <div className="payout-export-header">
          <span className="payout-export-title">Download Referral Payouts</span>
          <button className="payout-export-close" onClick={onClose} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        <div className="payout-export-body">
          <div className="custom-data-dropdown" ref={panelRef}>
            <button className="custom-data-trigger" onClick={() => setPanelOpen((v) => !v)}>
              <span>Custom Data</span>
              <FiChevronDown
                size={18}
                style={{ transform: panelOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>

            {panelOpen && (
              <div className="custom-data-panel">
                {PAYOUT_COLUMN_GROUPS.map((group) => (
                  <div className="column-group" key={group.key}>
                    <div className="column-group-row" onClick={() => toggleGroup(group)}>
                      <GroupCheckbox
                        checked={isGroupFullySelected(group)}
                        indeterminate={isGroupPartiallySelected(group)}
                        onChange={() => toggleGroup(group)}
                      />
                      <span>{group.label}</span>
                    </div>
                    {group.children &&
                      group.children.map((child) => (
                        <div className="column-child-row" key={child.key} onClick={() => toggleLeaf(child.key)}>
                          <input
                            type="checkbox"
                            className="column-checkbox"
                            checked={selectedKeys.has(child.key)}
                            onChange={() => toggleLeaf(child.key)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span>{child.label}</span>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="payout-preview-wrapper">
            {totalSelectedColumns === 0 ? (
              <div className="payout-preview-empty">Select at least one column to preview data.</div>
            ) : (
              <table className="payout-preview-table">
                <thead>
                  <tr>
                    {visibleGroups.map((group) =>
                      group.children ? (
                        <th key={group.key} colSpan={group.children.length} className="group-header">
                          {group.label}
                        </th>
                      ) : (
                        <th key={group.key} rowSpan={2}>
                          {group.label}
                        </th>
                      )
                    )}
                  </tr>
                  <tr>
                    {visibleGroups.flatMap((group) =>
                      group.children ? group.children.map((child) => <th key={child.key}>{child.label}</th>) : []
                    )}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.length === 0 ? (
                    <tr>
                      <td colSpan={totalSelectedColumns} className="payout-preview-empty">
                        No records to preview.
                      </td>
                    </tr>
                  ) : (
                    previewRows.map((row, i) => (
                      <tr key={i}>
                        {visibleGroups.flatMap((group) => {
                          const keys = group.children ? group.children.map((c) => c.key) : [group.key];
                          return keys.map((k) => <td key={k}>{row[k]}</td>);
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          {exportRows.length > PREVIEW_LIMIT && (
            <div className="payout-preview-note">
              Showing {PREVIEW_LIMIT} of {exportRows.length} records — the full set is included in the download.
            </div>
          )}
        </div>

        <div className="payout-export-footer">
          <button className="payout-export-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="payout-export-download-btn" onClick={handleDownload} disabled={totalSelectedColumns === 0}>
            <FiDownload size={15} /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default PayoutExportModal;
