  /* =================================================================
     v7: Bambu Studio project 3MF laid out the way Bambu Studio writes it:
     objects in 3D/Objects/object_1.model (production extension), a full
     Metadata/project_settings.config sized to this plate's filaments,
     model_settings.config with per-part extruders, slice_info and
     filament_sequence. Template: a Bambu Studio 02.07 project (X1, 0.4 mm).
     ================================================================= */
  const BBL_PROJECT = __DATA__("bambu-project.json");
  const uuid = (n, tag) => { const h = (v, l) => (v >>> 0).toString(16).padStart(l, "0").slice(-l); return `${h(n, 8)}-${h(tag * 7919 + n * 104729, 4)}-4${h(n * 31 + tag, 3)}-8${h(n * 977 + tag * 13, 3)}-${h(Date.now() & 0xffffff, 6)}${h(n * 65537 + tag, 6)}`; };
  function bblProjectSettings(hexes) {
    const d = JSON.parse(JSON.stringify(BBL_PROJECT)), F = d.filament_colour.length, N = hexes.length;
    for (const [k, v] of Object.entries(d)) {
      if (!Array.isArray(v)) continue;
      if (v.length === F) d[k] = Array.from({ length: N }, (_, i) => v[Math.min(i, F - 1)]);
      else if (v.length === 2 * F && k !== "flush_volumes_vector") d[k] = Array.from({ length: 2 * N }, (_, i) => v[(i % 2) + 2 * Math.min(Math.floor(i / 2), F - 1)]);
      else if (v.length === F * F) { const off = v.find((x) => x !== "0") || "280"; d[k] = Array.from({ length: N * N }, (_, i) => (Math.floor(i / N) === i % N ? "0" : off)); }
      else if (v.length === F + 2 && (k === "different_settings_to_system" || k === "inherits_group")) d[k] = Array.from({ length: N + 2 }, () => "");
    }
    d.filament_colour = hexes.map((h) => h.toUpperCase() + "FF");
    d.filament_self_index = Array.from({ length: 2 * N }, (_, i) => String(Math.floor(i / 2) + 1));
    // Polymaker's recommended nozzle temperature (inside both PolyLite PLA and PLA Pro ranges)
    for (const k of ["nozzle_temperature", "nozzle_temperature_initial_layer"]) if (Array.isArray(d[k])) d[k] = d[k].map(() => "210");
    return JSON.stringify(d, null, 4);
  }
  const to3MFv6 = NP.to3MF;
  NP.to3MF = function (model, colors, title, flavor = "bambu") {
    if (flavor !== "bambu" || !BBL_PROJECT) return to3MFv6(model, colors, title, flavor);
    const meshes = NP.meshes(model);
    const { plan, colors: fil } = NP.filamentPlan(model, colors);
    const parts = model.parts.filter((p) => meshes[p.slot].t.length);
    const ids = parts.map((_, i) => i + 1), top = parts.length + 1;
    const name = esc(title || "Nameplate");
    const NS = `xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:BambuStudio="http://schemas.bambulab.com/package/2021" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06" requiredextensions="p"`;
    const objs = parts.map((p, i) => meshObj(ids[i], p.label, meshes[p.slot], 0, 0).replace(`<object id="${ids[i]}"`, `<object id="${ids[i]}" p:UUID="${uuid(ids[i], 1)}"`)).join("\n");
    const objFile = `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" ${NS}>\n <metadata name="BambuStudio:3mfVersion">1</metadata>\n <resources>\n${objs}\n </resources>\n <build/>\n</model>\n`;
    const today = new Date().toISOString().slice(0, 10);
    const main = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" ${NS}>
 <metadata name="Application">BambuStudio-02.07.01.57</metadata>
 <metadata name="BambuStudio:3mfVersion">1</metadata>
 <metadata name="CreationDate">${today}</metadata>
 <metadata name="ModificationDate">${today}</metadata>
 <metadata name="Title">${name}</metadata>
 <metadata name="Designer">Charleston3D Nameplate Maker</metadata>
 <resources>
  <object id="${top}" p:UUID="${uuid(top, 2)}" type="model">
   <components>
${ids.map((id) => `    <component p:path="/3D/Objects/object_1.model" objectid="${id}" p:UUID="${uuid(id, 3)}" transform="1 0 0 0 1 0 0 0 1 0 0 0"/>`).join("\n")}
   </components>
  </object>
 </resources>
 <build p:UUID="${uuid(top, 4)}">
  <item objectid="${top}" p:UUID="${uuid(top, 5)}" transform="1 0 0 0 1 0 0 0 1 128 128 0" printable="1"/>
 </build>
</model>
`;
    const cfg = `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <object id="${top}">
    <metadata key="name" value="${name}"/>
    <metadata key="extruder" value="1"/>
${parts.map((p, i) => { const pl = plan.find((q) => q.slot === p.slot); const m = meshes[p.slot]; return `    <part id="${ids[i]}" subtype="normal_part">
      <metadata key="name" value="${esc(p.label)}"/>
      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>
      <metadata key="source_object_id" value="0"/>
      <metadata key="source_volume_id" value="${i}"/>
      <metadata key="extruder" value="${pl.filament}"/>
      <mesh_stat face_count="${m.t.length / 3}" edges_fixed="0" degenerate_facets="0" facets_removed="0" facets_reversed="0" backwards_edges="0"/>
    </part>`; }).join("\n")}
  </object>
  <plate>
    <metadata key="plater_id" value="1"/>
    <metadata key="plater_name" value=""/>
    <metadata key="locked" value="false"/>
    <metadata key="filament_map_mode" value="Auto For Flush"/>
    <metadata key="gcode_file" value=""/>
    <model_instance>
      <metadata key="object_id" value="${top}"/>
      <metadata key="instance_id" value="0"/>
      <metadata key="identify_id" value="${100 + top}"/>
    </model_instance>
  </plate>
  <assemble>
  </assemble>
</config>
`;
    const enc = new TextEncoder();
    return zipStore([
      { name: "[Content_Types].xml", data: enc.encode(`<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>\n <Default Extension="png" ContentType="image/png"/>\n <Default Extension="gcode" ContentType="text/x.gcode"/>\n</Types>\n`) },
      { name: "_rels/.rels", data: enc.encode(`<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n <Relationship Target="/3D/3dmodel.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>\n</Relationships>\n`) },
      { name: "3D/3dmodel.model", data: enc.encode(main) },
      { name: "3D/_rels/3dmodel.model.rels", data: enc.encode(`<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n <Relationship Target="/3D/Objects/object_1.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>\n</Relationships>\n`) },
      { name: "3D/Objects/object_1.model", data: enc.encode(objFile) },
      { name: "Metadata/project_settings.config", data: enc.encode(bblProjectSettings(fil)) },
      { name: "Metadata/model_settings.config", data: enc.encode(cfg) },
      { name: "Metadata/slice_info.config", data: enc.encode(`<?xml version="1.0" encoding="UTF-8"?>\n<config>\n  <header>\n    <header_item key="X-BBL-Client-Type" value="slicer"/>\n    <header_item key="X-BBL-Client-Version" value="02.07.01.57"/>\n  </header>\n</config>\n`) },
      { name: "Metadata/filament_sequence.json", data: enc.encode(`{"plate_1":{"nozzle_sequence":[],"optimal_assignment":[],"sequence":[]}}`) },
    ]);
  };
