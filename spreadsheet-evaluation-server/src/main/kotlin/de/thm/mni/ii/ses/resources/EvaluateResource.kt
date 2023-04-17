package de.thm.mni.ii.ses.resources

import de.thm.mni.ii.ses.models.Spreadsheet
import de.thm.mni.ii.ses.services.SpreadsheetService
import javax.inject.Inject
import javax.ws.rs.Consumes
import javax.ws.rs.GET
import javax.ws.rs.POST
import javax.ws.rs.Path
import javax.ws.rs.Produces
import javax.ws.rs.core.MediaType

@Path("/evaluate")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class EvaluateResource(
    private val spreadsheetService: SpreadsheetService,
) {
    @POST
    fun evaluate(spreadsheet: Spreadsheet): Spreadsheet =
        spreadsheetService.evaluate(spreadsheet)
}
