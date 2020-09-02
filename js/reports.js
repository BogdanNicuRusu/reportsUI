$(document).ready(function(){
	
	var editReportError = localStorage['editReportError'];
	if (editReportError) {
		$('#add-report-error-message').text(editReportError);
		$('#add-report-error').show();
	}
	localStorage.removeItem('editReportError');
	var headerText = localStorage['logged'] ? `Hello, ${localStorage['username']}!` : 'Could not find logged user';
	$('#header-message').text(headerText);
	$.ajax({
		type: 'GET',
		url: computeUrl('reports'),
		headers: {
			'Authorization': localStorage['logged'] ? localStorage['token'] : ''
		},
		contentType: 'application/json; charset=utf-8',
		success: function(result) {
			$('#reports-summary').text(`${result.length} report(s) available`);
			displayReportList(result);
		},
		error: function(result) {
			$('#reports-summary').text("Could not retrieve reports");
		}
	});
	
	$("#add-report-button").click(function(e) {
		reportName = $('#report-name').val();
		reportType = $('#report-type').val();
		$.ajax({
			type: 'POST',
			url: computeUrl('reports'),
			headers: {
				'Authorization': localStorage['logged'] ? localStorage['token'] : ''
			},
			data: JSON.stringify({
				'name': `${reportName}`,
				'type': `${reportType}`
			}),
			contentType: 'application/json; charset=utf-8',
			success: function(result) {
				location.reload();
			},
			error: function(result) {
				$('#add-report-error-message').text(result.responseJSON.message);
				$('#add-report-error').show();
			}
		});
	});

	$(document).on('click', '.delete-report', function() {
		var id = $(this).val();
		$.ajax({
			type: 'DELETE',
			url: computeUrl(`reports/${id}`),
			headers: {
				'Authorization': localStorage['logged'] ? localStorage['token'] : ''
			},
			success: function(result) {
				location.reload();
			},
			error: function(result) {
				$('#add-report-error-message').text(result.responseJSON.message);
				$('#add-report-error').show();
			}
		});
	});

	$(document).on('click', '.edit-report', function() {
		var id = $(this).val();
		reportName = $(`.report-name[value=${id}]`).val();
		reportType = $(`.report-type[value=${id}]`).val();
		$.ajax({
			type: 'PUT',
			url: computeUrl(`reports/${id}`),
			headers: {
				'Authorization': localStorage['logged'] ? localStorage['token'] : ''
			},
			data: JSON.stringify({
				'name': `${reportName}`,
				'type': `${reportType}`
			}),
			contentType: 'application/json; charset=utf-8',
			success: function(result) {
				location.reload();
			},
			error: function(result) {
				localStorage['editReportError'] = result.responseJSON.message;
				location.reload();

			}
		});
	});

	$(document).on('click', '.download-report', function() {
		var id = $(this).val();
		downloadFile(id);
	});

	$('#add-report-icon-button').click(function(e) {
		var isVisible = $('#add-report-form').is(':visible');
		isVisible ? $('#add-report-form').hide() : $('#add-report-form').css('display', 'inline-block');
	});

	$('#add-report-error').click(function(e) {
		$('#add-report-error').hide();
	});
});

 function downloadFile(reportId) {
    var req = new XMLHttpRequest();
    req.open("GET", computeUrl(`reports/${reportId}`), true);
	req.setRequestHeader('Authorization', localStorage['logged'] ? localStorage['token'] : '');
	req.setRequestHeader('Accept', 'text/csv');
    req.onload = function (event) {
		if (req.status == 200) { 
			var resp = req.response;
			var binary = [];
			binary.push(resp);
			var reportName = $(`.report-name[value=${reportId}]`).val();
			var link = document.createElement('a');
			link.href = window.URL.createObjectURL(new Blob(binary));
			link.download = reportName + '.csv';
			link.click();
		}
		else {
			$('#add-report-error-message').text('Could not download report');
			$('#add-report-error').show();
		}
    };
    req.send();
 }

function displayReportList(reports) {
	var table = 
	`<table class=\"table\">
		<thead>
			<tr>
				<th scope="col">#</th>
				<th scope="col">Name</th>
				<th scope="col">Type</th>
				<th scope="col">Status</th>
				<th scope="col">Created</th>
				<th scope="col">Last updated</th>
				<th scope="col">Actions</th>
			</tr>
		</thead>
		<tbody>
			${reportsTableRows(reports)}
		</tbody>
	</table>`;
	$('#reports-table').html(table);
}

function reportsTableRows(reports) {
	var html = '';
	reports.forEach(function(item, index) {
		html = html + reportsTableRow(index, item);
	});
	return html;
}

function reportsTableRow(index, report) {
	var disabled = report.status == 'DONE' ? '' : 'disabled';
	return `<tr>
		<th scope="row">${index + 1}</th>
		<td><textarea value="${report.id}" class="report-name" style="resize: none; border: none">${report.name}</textarea></td>
		<td><textarea value="${report.id}" class="report-type" style="resize: none; border: none">${report.type}</textarea></td>
		<td>${report.status}</td>
		<td>${report.created}</td>
		<td>${report.updated}</td>
		<td>
			<button value="${report.id}" type="button" class="edit-report btn btn-outline-dark">
				<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" d="M11.293 1.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-.39.242l-3 1a1 1 0 0 1-1.266-1.265l1-3a1 1 0 0 1 .242-.391l9-9zM12 2l2 2-9 9-3 1 1-3 9-9z"/>
					<path fill-rule="evenodd" d="M12.146 6.354l-2.5-2.5.708-.708 2.5 2.5-.707.708zM3 10v.5a.5.5 0 0 0 .5.5H4v.5a.5.5 0 0 0 .5.5H5v.5a.5.5 0 0 0 .5.5H6v-1.5a.5.5 0 0 0-.5-.5H5v-.5a.5.5 0 0 0-.5-.5H3z"/>
				</svg>
			</button>
			<button value="${report.id}" type="button" class="download-report btn btn-outline-dark" ${disabled}>
				<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-download" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
					<path fill-rule="evenodd" d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
				</svg>
			</button>
			<button value="${report.id}" type="button" class="delete-report btn btn-outline-dark">
				<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z"/>
				</svg>
			</button>
		</td>
    </tr>`;
}