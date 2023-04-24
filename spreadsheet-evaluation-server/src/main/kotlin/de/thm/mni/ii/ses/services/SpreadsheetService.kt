package de.thm.mni.ii.ses.services

import de.thm.mni.ii.ses.models.Spreadsheet
import org.apache.poi.ss.formula.FormulaParseException
import org.apache.poi.ss.formula.eval.NotImplementedException
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.jboss.logging.Logger
import javax.enterprise.context.ApplicationScoped

@ApplicationScoped
class SpreadsheetService {
    private val logger = Logger.getLogger(SpreadsheetService::class.java)

    fun evaluate(spreadsheet: Spreadsheet): Spreadsheet =
        fillWithValues(spreadsheet, fromArray(spreadsheet))

    private fun fromArray(spreadsheet: Spreadsheet): XSSFWorkbook {
        val workbook = XSSFWorkbook()
        val sheet = workbook.createSheet()

        spreadsheet.cells.forEachIndexed { i, row ->
            val sheetRow = sheet.getRow(i) ?: sheet.createRow(i)
            row.forEachIndexed { j, cell ->
                val sheetCell = sheetRow.getCell(j) ?: sheetRow.createCell(j)
                if (cell is Int) {
                    sheetCell.setCellValue(cell.toDouble())
                } else if (cell is Double) {
                    sheetCell.setCellValue(cell)
                } else if (cell is String) {
                    if (cell.startsWith("=")) {
                        try {
                            sheetCell.cellFormula = cell.removePrefix("=")
                        } catch (_: FormulaParseException) {
                            sheetCell.setCellValue("!ERROR! Fehlerhafte Funktion")
                        } catch (e: Exception) {
                            logger.error("Unhandled error while setting formula", e)
                            sheetCell.setCellValue("!ERROR! Fehler beim Zuweisen der Formel")
                        }
                    } else {
                        sheetCell.setCellValue(cell)
                    }
                }
            }
        }

        return workbook
    }

    private fun fillWithValues(spreadsheet: Spreadsheet, workbook: XSSFWorkbook): Spreadsheet = workbook.creationHelper.createFormulaEvaluator().let { evaluator ->
        Spreadsheet(spreadsheet.cells.mapIndexed { i, row ->
            val sheetRow = workbook.getSheetAt(0).getRow(i)
            List(row.size) { j ->
                val sheetCell = sheetRow.getCell(j)

                when (sheetCell.cellType) {
                    CellType.FORMULA -> {
                        try {
                            val formulaValue = evaluator.evaluate(sheetCell)
                            when (formulaValue.cellType) {
                                CellType.NUMERIC -> formulaValue.numberValue
                                CellType.STRING -> formulaValue.stringValue
                                CellType.ERROR -> "!ERROR! Fehler"
                                else -> ""
                            }
                        } catch (_: NotImplementedException) {
                            "!ERROR! Unbekannte Funktion"
                        } catch (e: Exception) {
                            logger.error("Unhandled error while evaluating formula", e)
                            "!ERROR! Fehler beim Auswerten der Formel"
                        }
                    }
                    CellType.NUMERIC -> sheetCell.numericCellValue
                    CellType.STRING -> sheetCell.stringCellValue
                    else -> ""
                }
            }
        })
    }
}
