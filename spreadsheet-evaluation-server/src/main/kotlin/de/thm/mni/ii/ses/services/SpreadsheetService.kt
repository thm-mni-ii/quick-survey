package de.thm.mni.ii.ses.services

import de.thm.mni.ii.ses.models.Spreadsheet
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.xssf.usermodel.XSSFSheet
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import java.lang.IllegalArgumentException
import javax.enterprise.context.ApplicationScoped

@ApplicationScoped
class SpreadsheetService {
    fun evaluate(spreadsheet: Spreadsheet): Spreadsheet =
        fillWithValues(spreadsheet, fromArray(spreadsheet))

    private fun fromArray(spreadsheet: Spreadsheet): XSSFSheet {
        val workbook = XSSFWorkbook()
        val sheet = workbook.createSheet()
        val evaluator = workbook.creationHelper.createFormulaEvaluator()

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
                        sheetCell.cellFormula = cell.removePrefix("=")
                    } else {
                        sheetCell.setCellValue(cell)
                    }
                }
            }
        }

        evaluator.evaluateAll()
        return sheet
    }

    private fun fillWithValues(spreadsheet: Spreadsheet, sheet: XSSFSheet): Spreadsheet =
        Spreadsheet(spreadsheet.cells.mapIndexed { i, row ->
            val sheetRow = sheet.getRow(i)
            List(row.size) { j ->
                val sheetCell = sheetRow.getCell(j)

                when (sheetCell.cellType) {
                    CellType.FORMULA -> try  {
                        sheetCell.numericCellValue
                    } catch (e: IllegalStateException)  {
                        sheetCell.stringCellValue
                    }
                    CellType.NUMERIC -> sheetCell.numericCellValue
                    CellType.STRING -> sheetCell.stringCellValue
                    else -> ""
                }
            }
        })
}