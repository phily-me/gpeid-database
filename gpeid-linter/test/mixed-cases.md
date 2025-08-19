# Mixed Test Cases - Valid and Invalid gpEID Identifiers

This document contains a mix of valid and invalid gpEID identifiers embedded in markdown text to test the linter's ability to find and validate inline identifiers.

## Project Documentation

### Valid Equipment IDs

The following equipment has been registered in our system:

- Main HVAC controller: =Building1+HLK_Controller.001:Siemens.S7-1200
- Emergency lighting: =Building1.Floor2+EME.LIG_Emergency.015:Schneider.XY123
- Security camera at entrance: =Campus.MainGate+SEC_Camera.001:Axis.P3245-LVE

### Invalid IDs Found During Audit

We discovered several incorrectly formatted IDs that need to be fixed:

- Broken sensor ID: =TBD+HLK_Sensor.001:Vendor.Product (Liegenschaft cannot be TBD!)
- Missing prefix: Building+HLK_Motor.002:ABB.ACS580 (needs = prefix)
- Wrong counter: =Workshop+MEC_Drill.00:Bosch.GSB (counter must be 3 digits)

## System Architecture

### Valid Complex Identifiers

Our distributed system uses these identifiers:

1. **Data Center Equipment**
   - Server rack: =DataCenter.Row5.Rack12+NET_Switch.048:Cisco.Catalyst9300-48P$Power.PoE|VLAN.100
   - UPS System: =DataCenter.PowerRoom+PWR_UPS.001:APC.SmartUPS-10kVA-Redundancy.N1

2. **Manufacturing Floor**
   - Assembly robot: =Factory.Line1+MAN.ROB_Welding.003:KUKA.KR16-2$Program.WeldSeam|Zone.A
   - Conveyor control: =Factory.Line1.Station5+MAN.CON_Belt.012:Siemens.G120C

### More Invalid Examples

These were submitted but rejected by the validation system:

- =Building+hlk_Sensor.001:Vendor.Product (function must be uppercase: HLK not hlk)
- =Office+ADM_Computer.999:Dell (missing product model after manufacturer)
- =Lab+EQU_Microscope.000:Zeiss.Axio (counter cannot be 000)

## German Office Locations

### Valid German Identifiers

Equipment in our German offices:

- München office heater: =München.Büro3+HLK_Heizung.042:Viessmann.Vitodens
- Zürich lab equipment: =Zürich.Labor+LAB_Zentrifuge.001:Eppendorf.5804R
- Wien server room: =Österreich.Wien.Serverraum+NET_Router.001:Fritzbox.7590

### Testing Edge Cases

Some valid edge cases that should pass:

- With gaps: =Site1..Room5+TBD.HLK_TBD.005:TBD.TBD (gaps and TBD allowed except in Liegenschaft)
- Multiple extensions: =Lab+CHE_Analyzer.001:Agilent.GCMS-Config.2024$Cal.2024|Service.Annual
- Long hierarchy: =Campus.BuildingA.Floor3.Wing2.Room42.Cabinet7+ELE.SEN_Temperature.123:Fluke.62Max

Invalid edge cases that should fail:

- Pure numbers in type: =Building+HLK_12345.001:Vendor.Product
- Too many product parts: =Building+HLK_Sensor.001:Vendor.Product.Version.Extra
- Space in identifier: =Building Name+HLK_Sensor.001:Vendor.Product

## Summary Table

| Description | Identifier | Status |
|------------|-----------|---------|
| Valid basic | =Office+SEC_Badge.001:HID.iClass | ✓ Valid |
| Invalid prefix | Office+SEC_Badge.001:HID.iClass | ✗ Invalid |
| Valid with extension | =Lobby+DIS_Screen.001:Samsung.QM65R-Info.Lobby | ✓ Valid |
| Invalid function | =Building+ABCD_Device.001:Make.Model | ✗ Invalid |
| Valid German | =Gebäude+TÜV_Prüfgerät.100:Müller.TestGerät | ✓ Valid |
| Invalid counter | =Room+ELE_Socket.1234:ABB.2CDS | ✗ Invalid |

## Notes

Remember that valid gpEID format is: =Location+Function_Type.Counter:Manufacturer.Product with optional extensions using -, $, or | separators.