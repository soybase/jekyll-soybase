<?
function build_head_start_sb()
{
	//build_head() Will create the header for the SOYBASE HOME page
	//This code borrowed from soybase.org
	//Pre: None
	//Post: Prints Headder in html tables
	//TODO: Modify so not non standard Also change links  --ATD
	$header = '
		<table width = 1000>
			<tr>
			<td valign="top"><a href = "/"><img src ="/images/new.jpg" height = 85 border = 0></img></a></td>
				<td valign="top"><table cell padding = 0 cellspacing = 0>
				<tr>
	          <td>
	          <font class = "largegreen"><i>SoyBase&nbsp;  and&nbsp;  The&nbsp; Soybean&nbsp; Breeder\'s&nbsp;  Toolbox</i></font>
	          <font class = "smallgreen"><br /><b>Knowledge &nbsp; and &nbsp; tools &nbsp; for &nbsp; soybean &nbsp; breeders &nbsp; and &nbsp; researchers</b> <br /></font>
	          </td>
				</tr>
				<tr>
				<td background = "/images/light_tan.gif" height = 3></td>
				</tr>
				<td valign ="top">
				<table valign="top"  align="center" border = "0" cellpadding="2" width = 100%  >
		';
		echo $header;
		return 0;
}

function build_head_start_sbt()
{
	//build_head() Will create the header for the SOYBEAN BREEDER'S TOOLBOX page
	//This code borrowed from soybase.org
	//Pre: None
	//Post: Prints Headder in html tables
	//TODO: Modify so not non standard Also change links  --ATD
	$header = '
		<table width = 1000>
			<tr>
			<td valign="top"><a href = "/"><img src ="/images/sbt_pic.jpg" height = 85 border = 0></img></a></td>
				<td valign="top"><table cell padding = 0 cellspacing = 0>
				<tr>
				<td><font class = "largegreen"><i>The &nbsp; Soybean&nbsp; Breeders&nbsp;  Toolbox</i></font>
				<font class = "smallgreen"><br /><b>Integrating genetics and molecular biology for the soybean researcher</b></font><br />
				</td>
				</tr>
				<tr>
				<td background = "/images/light_tan.gif" height = 3></td>
				</tr>
				<td valign ="top">
				<table valign="top"  align="center" border = "0" cellpadding="2" width = 100%  >
		';
		echo $header;
		return 0;
}

function build_head_start_pmd()
{
	//build_head() Will create the header for the PHYSICAL MAP page
	//This code borrowed from soybase.org
	//Pre: None
	//Post: Prints Headder in html tables
	//TODO: Modify so not non standard Also change links  --ATD
	$header = '
		<table width = 1000>
			<tr>
			<td valign="top"><a href = "/"><img src ="/images/new.jpg" height = 85 border = 0></img></a></td>
				<td valign="top"><table cell padding = 0 cellspacing = 0>
				<tr>
				<td><font class = "largegreen"><i>Soybean Cultivar "Williams" Physical Map</i></font>
				<font class = "smallgreen"><br>Integrating the soybean genetic and physical maps</br></font>
				</td>
				</tr>
				<tr>
				<td background = "/images/light_tan.gif" height = 3></td>
				</tr>
				<td valign ="top">
				<table valign="top"  align="center" border = "0" cellpadding="2" width = 100%  >
		';
		echo $header;
		return 0;
}

function build_head_end()
{
	//build_head() Will create the header for the website
	//This code borrowed from soybase.org
	//Pre: None
	//Post: Prints Headder in html tables
	//TODO: Modify so not non standard Also change links  --ATD
	$header = '
				</table>
				<tr><td background = "/images/light_tan.gif" height=�3�></td></tr>
				</table>
				</table>
				</div>
		';
		echo $header;
		return 0;
}

function build_link_line()
{
	//iframe antispam is an invisible iframe that will allow us to do the antispam redirect --ATD
	$link_line_html = '
		<tr>
		<iframe name="antispam" style="width:0px; height:0px; border: 0px" src=""></iframe>
		<td><a href = "/"><font class = "smallplain">SoyBase Home <td>
		<font class = "smallplain"> | </td> </a></td> </font>
		<td><a href="/sbt" target = _blank><font class = "smallplain">Breeder&#39s Toolbox<td><font class = "smallplain"> | </td> </a></font></td>
		<td><a href="/pmd" target = _blank><font class = "smallplain">Williams Physical Map<td><font class = "smallplain"> | </td> </a></font></td>
		<td><a href="/community.php"><font class = "smallplain">Resources <td><font class = "smallplain"> | </td> </font></a></td>
		<td><a href="/Blast_Search.php" target = _blank><font class = "smallplain">BLAST & Search <td><font class = "smallplain"> | </td> </font></a></td>
		<td><a href="/include/antispam.php" target="antispam"><font class = "smallplain">Contact Us <td><font class = "smallplain"> </td> </font></a></td>
		</tr>
	';
	echo $link_line_html;
	return 0;
}

function build_search_sbt()
{
	//build_search() builds the search bar on the Genetic Map page
	//pre: none
	 $sTxt='

                 <div class = "main">
                 <form action="search/search_results.php" method="get" target="_self">

                 &nbsp;Search&nbsp;
                 <select name="category">
                 	<option value="All">All Categories
                 	<option value="LocusName">Locus
                 	<option value="MapName">Map
                 	<option value="Map_CollectionName">Map Collection
                 	<option value="QTLName">QTL
                	<option value="Soybase_ID">Paper
                 	<option value="PathologyName">Pathology
                 	<option value="DiseaseName">Disease
                 	<option value="GermplasmName">Germplasm
                 	<option value="Insect_pestsName">Insect Pests
                 	<option value="GeneName">Genes
                 </select>

                 &nbsp;for&nbsp; <input size=25 type="text" name="search_term">&nbsp;&nbsp;
                 <input type="submit" value="go">
                </form>
                </div>


                                             ';

	echo $sTxt;
	return 0;
}

function build_search2_sbt()
{
	//build_search() builds the search bar on the top of the top of the homepage
	//pre: none
	//Post: prints search header to the page
	//modified by RTN on 09-17 to determine the options by refering to the $aConfArray
	//loaded from the sbt-conf file (toolbox.conf)
	include_once ("include/functions.php");

	$sConfFileName = "search/toolbox.conf";
	$aComposite = fReadConfigFile($sConfFileName);
 	$aConfArray = $aComposite[0];

	 $sTxt='

                 <div class = "move">
                 <div class = "main">
                 <table height = 25 width = 500><td>Search the database for specific items by name here:</td></table><br>
                 <form action="/sbt/search/search_results.php" method="get" target="_self">

                 <span class = "description">
                 <font><b>Search Database</b></font>
                 </span>

                 <select name="category"><option value="All">All Categories';
     //echo $sTxt;
     	while ($aClassKeyValue = each($aConfArray))
	{
		$sClassKey = $aClassKeyValue['key'];
		$sClassTable = key($aConfArray[$sClassKey]);
		$sClassName = $aConfArray[$sClassKey][$sClassTable]['0'];
		$vStarPos = strpos($sClassName, '*');
		if ( $vStarPos !== FALSE ) $sClassName = trim( substr($sClassName, $vStarPos + 1) );
		$sTxt .="<option value=\"{$sClassKey}\">{$sClassName}";
		//echo $sTxt;
	}
	$sTxt .= "</select>\n";
	$sTxt .='
                 for <input size=17 type="text" name="search_term">
                 <input type="submit" value="go"><a href="/help_body.html" target="_self" class="helpb
ar">&nbsp;&nbsp;Help</a>
                </form>
                </div>
                </div>


                                             ';

	echo $sTxt;
	return 0;
}



function build_search_pmd()
{
	//build_search_pmd() builds the search bar on the physical map page
	//pre: none
	//Post: prints search header to the page

	$sTxt="<form id='sub_form' name='sub_form' action='/sbt/highlighting/search_results.php' 			 target='search_results' method='GET'>
		&nbsp;&nbsp;&nbsp;Search
		<input size=17 type='text' name='search_term'>
		<select name='category'>
		<option value='contig'>Contig
		<option value='BAC'>BAC
		<option value='marker'>Marker
		</select>
		<input type='submit' value='Go' /></form>";
		echo $sTxt;
		return 0;
}
function fChrConvert($sChr)
{
	//fChrConvert takes either the old lettered version of the soybean or the new numbered name... and returns the other version
	//ie if you call fChrConvert("A1")  The function will return "5"  If the string passed in $schr does not exist it will return NULL
	switch($sChr)
	{
		case "A1":
			return "5";
			break;
		case "A2":
			return "8";
			break;
		case "B1":

  return "11";

  break;
		case "B2":

  return "14";

  break;
		case "C1":

  return "4";

  break;
		case "C2":

  return "6";

  break;
		case "D1a":

  return "1";

  break;
		case "D1b":

  return "2";

  break;
		case "D2":

  return "17";

  break;
		case "E":

  return "15";

  break;
		case "F":

  return "13";

  break;
		case "G":

  return "18";

  break;
		case "H":

  return "12";

  break;
		case "I":

  return "20";

  break;
		case "J":

  return "16";

  break;
		case "K":

  return "9";

  break;
		case "L":

  return "19";

  break;
		case "M":

  return "7";

  break;
		case "N":

  return "3";

  break;
		case "O":

  return "10";

  break;
		case "5":

  return "A1";

  break;
		case "8":

		   return "A2";

  break;
		case "11":

  return "B1";

  break;
		case "14":

  return "B2";

  break;
		case "4":

  return "C1";

  break;
		case "6":

  return "C2";

  break;
		case "1":

  return "D1a";

  break;
		case "2":

  return "D1b";

  break;
		case "17":

  return "D2";

  break;
		case "15":

return "E";
		   break;
		case "13":

  return "F";

  break;
		case "18":

  return "G";

  break;
		case "12":

  return "H";

  break;
		case "20":

  return "I";

  break;
		case "16":

  return "J";

  break;
		case "9":

  return "K";

  break;
		case "19":

  return "L";

  break;
		case "7":

  return "M";

  break;
		case "3":

  return "N";

  break;
		case "10":

  return "O";

  break;
		default:
			return NULL;
	}
}

function build_lg3()
{	//build_lg3 will generate the Linkage group table for the homepage
	//Pre: none
	//Post: prints the linkage group list
	function fMakeLink($sLG)
	{
		//$sURL = "warning.php?LinkageGroup=";
		//$sURL = "/cmap/cgi-bin/cmap/viewer?ref_map_set_aid=GmConsensus30;ref_map_aids=GmConsensus30_"
        //         . $sLG . ";comparative_maps=-1%3Dmap_aid%3DGmWmPhys2008_"
        //         . $sLG ."%3A1%3Dmap_aid%3DGmComposite2003_" . $sLG. ";data_source=CMAP'";
		$sURL = "http://cmap.soybase.org/viewer?ref_map_set_aid=GmComposite2003_;ref_map_aids=GmComposite2003_"  . $sLG .
		        ";comparative_maps=-1%3Dmap_aid%3DGmGWAS_" . $sLG . ";data_source=sbt_cmap";
        $sChr=fChrConvert($sLG);
		//echo "<a href=\"" . $sURL . $sLG . "\" target=\"_blank\">" . $sLG . "</a> ";
		echo "<td class='wpm_tbl' align=\"center\"><a href=\"". $sURL . "\">".$sLG."</a><br><br><br><a href=\"". $sURL . "\">".$sChr."</a></TD>";
	}

	$sTxt="<TABLE align=\"center\" width=700 border=0>\n\t\t<TR><TD align=\"right\">Linkage Group<br><br>Chromosome Number </TD>\n\t\t";
	echo $sTxt;
		fMakeLink("A1");
		fMakeLink("A2");
		fMakeLink("B1");
		fMakeLink("B2");
		fMakeLink("C1");
		fMakeLink("C2");
		fMakeLink("D1a");
		fMakeLink("D1b");
		fMakeLink("D2");
		fMakeLink("E");
		fMakeLink("F");
		fMakeLink("G");
		fMakeLink("H");
		fMakeLink("I");
		fMakeLink("J");
		fMakeLink("K");
		fMakeLink("L");
		fMakeLink("M");
		fMakeLink("N");
		fMakeLink("O");
	$sTxt="\t\t</TR>\n\t</TABLE>\n";
	echo $sTxt;

	return 0;
}

function build_lg4()
{	//build_lg4 will generate the Linkage group table for the homepage
	//Pre: none
	//Post: prints the linkage group list
	function fMakeLink($sLG)
	{
		$sURL = "warning.php?LinkageGroup=";
		$sURL = "http://cmap.soybase.org/viewer?ref_map_set_aid=GmConsensus30;ref_map_aids=GmConsensus30_"
                 . $sLG . ";comparative_maps=-1%3Dmap_aid%3DGmWmPhys2008_"
                 . $sLG ."%3A1%3Dmap_aid%3DGmComposite2003_" . $sLG. ";data_source=pmd";
		//$sURL = "/cmap/cgi-bin/cmap/viewer?ref_map_set_aid=GmComposite2003_;ref_map_aids=GmComposite2003_"  . $sLG .
		//        ";comparative_maps=-1%3Dmap_aid%3DGmConsensus30_" . $sLG . ";data_source=CMAP'";
        $sChr=fChrConvert($sLG);
		//echo "<a href=\"" . $sURL . $sLG . "\" target=\"_blank\">" . $sLG . "</a> ";
		echo "<td class='wpm_tbl' align=\"center\"><a href=\"". $sURL . "\">".$sLG."</a><br><br><br><a href=\"". $sURL . "\">".$sChr."</a></TD>";
	}

	$sTxt="<TABLE align=\"center\" width=700 border=0>\n\t\t<TR><TD align=\"right\">Linkage Group<br><br>Chromosome Number </TD>\n\t\t";
	echo $sTxt;
		fMakeLink("A1");
		fMakeLink("A2");
		fMakeLink("B1");
		fMakeLink("B2");
		fMakeLink("C1");
		fMakeLink("C2");
		fMakeLink("D1a");
		fMakeLink("D1b");
		fMakeLink("D2");
		fMakeLink("E");
		fMakeLink("F");
		fMakeLink("G");
		fMakeLink("H");
		fMakeLink("I");
		fMakeLink("J");
		fMakeLink("K");
		fMakeLink("L");
		fMakeLink("M");
		fMakeLink("N");
		fMakeLink("O");
	$sTxt="\t\t</TR>\n\t</TABLE>\n";
	echo $sTxt;

	return 0;
}

function build_lg5(){	//build_lg5 will generate the Linkage group table for the genetic vs. sequence map order comparisons
	//Pre: none
	//Post: prints the linkage group list
	function fMakeLink5($sLG){
		//$sURL = "warning.php?LinkageGroup=";
		//$sURL = "/cmap/cgi-bin/cmap/viewer?ref_map_set_aid=GmConsensus30;ref_map_aids=GmConsensus30_"
        //         . $sLG . ";comparative_maps=-1%3Dmap_aid%3DGmWmPhys2008_"
        //         . $sLG ."%3A1%3Dmap_aid%3DGmComposite2003_" . $sLG. ";data_source=CMAP'";
        $sChr=fChrConvert($sLG);
		$sURL = '/cmap/cgi-bin/cmap/viewer?'
              . 'data_source=sequence_genetic4;'
              . 'ref_map_set_acc=GmConsensus40bp;'
              . 'ref_map_accs=GmConsensus40bp_' . sprintf('Gm%02d', $sChr) . ';'
              . 'comp_map_set_right=GmConsensus40cM;'
              . 'comparative_map_right=GmConsensus40cM_' . $sLG . ';'
              . 'ref_species_acc=Glycine_max;'
              . 'data_source=sequence_genetic4';
		#$sURL = "/cmap/cgi-bin/cmap/viewer?ref_map_set_aid=GmComposite2003_;ref_map_aids=GmComposite2003_"  . $sLG .
		//echo "<a href=\"" . $sURL . $sLG . "\" target=\"_blank\">" . $sLG . "</a> ";
		echo "<td class='wpm_tbl' align=\"center\"><a href=\"". $sURL . "\">".$sLG."</a><br /><br /><br /><a href=\"". $sURL . "\">".$sChr."</a></td>";
	}
	$sTxt="<table style=\"text-align:center;width:700px;border:none 0px;\">\n\t\t<tr><td align=\"right\">Linkage Group<br /><br />Chromosome Number </td>\n\t\t";
	echo $sTxt;
		fMakeLink5("A1");
		fMakeLink5("A2");
		fMakeLink5("B1");
		fMakeLink5("B2");
		fMakeLink5("C1");
		fMakeLink5("C2");
		fMakeLink5("D1a");
		fMakeLink5("D1b");
		fMakeLink5("D2");
		fMakeLink5("E");
		fMakeLink5("F");
		fMakeLink5("G");
		fMakeLink5("H");
		fMakeLink5("I");
		fMakeLink5("J");
		fMakeLink5("K");
		fMakeLink5("L");
		fMakeLink5("M");
		fMakeLink5("N");
		fMakeLink5("O");
	$sTxt="\t\t</tr>\n\t</table>\n";
	echo $sTxt;
	return 0;
}

function build_bottom()
{
	//build_bottom() draws bottom information about curator contact and usda sponsorship
	$sTxt='<br /><br /><br /><br /><br />
	<style>#bottom_icon_bar_table{margin:0 auto;border:none;}
	#bottom_icon_bar_table div{border:none;}
	#bottom_icon_bar_table td{border:none;}
	#bottom_icon_bar_table img{border:none;}
	</style>
	<table style="margin:0 auto;border:none;" id="bottom_icon_bar_table">
		<tr><td colspan="3">Funded by the USDA-ARS. Developed by the USDA-ARS SoyBase and Legume Clade Database group at the Iowa State University, Ames, IA</td></tr>
		<tr><td>&nbsp;</td></tr>
		<tr>
			<td>
				<div>
				<a href="https://www.usa.gov/government-works">U.S.&nbsp;Public&nbsp;Domain<br /><img border="0" src="/images/od_80x15_blue.png" /></a>
				</div>
			</td>
			<td>
				<div>
				<a href="http://www.usda.gov/wps/portal/usdahome"><img border="0" style="width:72px;" src="/images/USDA-Logo.png" alt="USDA Logo"></a>
				</div>
			</td>
			<td>
				<div style="padding-left:5em;"><a href="http://www.iastate.edu"><img border="0" src="/images/isu.gif" alt="Iowa State University Logo"></a>
				</div>
			</td>
		</tr>
	</table>';
	echo $sTxt;
	return 0;
}


/*  This cut of code randomizes an array of images and then places two of them into the right hand side of the homepage
*/

function draw_pictures()
{
	//this function takes the array image_titles and randomizes it so each time the page is loaded a new random set of images are loaded
	//pre: none
	//post: returns $image_titles, a random array of images and their captions

	//edit this array to add images
	//image_titles_fun is the first img box, use this one for "fun soybean photos"
	$image_titles_fun =
	        array(
				array("soybeans_ghouse_Jamie.png", "Soybeans in a reseach greenhouse"),
				array("sbhar.gif", "Soybean acreage by county, 2003. Credit: USDA - National Agricultural Statistics Service"),
				array("RPalmer_Soyflower2_sm.gif", "Soybean flowers. Credit: Reid G. Palmer, USDA-ARS"),
				array("RPalmer_SoyflowerBee3.png", "Bee on soybean flowers. Credit: Reid G. Palmer, USDA-ARS"),
				array("dgrant_A2_3_panes.jpg", "Physical and genetic map images from Soybean Breeder&#34;s Toolbox"),
				array("dgrant_A2_contig_info_short.jpg", "Example of physical contig information from Soybean Breeder&#34;s Toolbox"),
				array("Fish1.jpg", "Soybean chromosomes. Seth Findley, Stacey Lab, Univ. Missouri")

	        );
	//image_titles_screen is for the second img box, use this for pictures of sbt and the like
	$image_titles_screen=
	        array(
				array("developing_pods_jamie.png", "Developing soybean pods"),
				array("soy_flower_jamie.png", "Soybean plant and flower"),
				array("soy_seeds_jamie.png", "A closeup of soybean seeds"),
				array("SMVinfected_soy_jamie.png", "A soybean leaf infected with Soybean Mosaic Virus"),
				array("developing_plants_jamie.png", "Developing soybean plants"),
				array("1_week_old_jamie.png", "One week old soybean plant"),
				array("rtnelson_asian_aphids.gif", "Asian aphids on soybean"),
				array("rtnelson_asian_aphids_close.gif", "Soybean aphids"),
				array("rtnelson_fieldofsoy65.gif", "Soybean field"),
				array("rtnelson_fieldofsoy65_close.gif", "Soybean field"),
				array("rtnelson_fieldofsoy65_close2.gif", "Soybean field"),
				array("rtnelson_predation10.gif", "White fly larvae"),
				array("rtnelson_predation10_close.gif", "White fly larvae"),
				array("curved_field.gif", "Soyben field"),
				array("img1002.gif", "Soybean seedlings"),
				array("img1006.png", "Soybean flowers"),
				array("img1007.gif", "Soybean leaves"),
				array("img1009.gif", "Soybean pods"),
				array("img1013.png", "Soybean seeds and pods"),
				array("img1018.gif", "Soybean pods"),
				array("img1020.gif", "Mature soybeans"),
				array("img1036.gif", "Soybean seeds at harvest"),
				array("img1039.gif", "Soybeans being harvested"),
				array("img1046.gif", "Soybean field"),
				array("img1052.gif", "Soybean seeds at harvest"),
				array("img1082.gif", "Soybean - insect damage"),
				array("img1087.gif", "Soybean - insect damage"),
				array("k4389-2i.jpg", "Soybean seeds and pods"),
				array("dgrant_overgo_popup.jpg", "Scoring genetic marker (overgo) hybridization signals"),
				array("dgrant_overgo_right_panel.jpg", "Scoring genetic marker (overgo) hybridization signals"),
				array("BeanMachine2c.jpg", "2006 bio-diesel VW-bug")
	        );
	$image_count = count($image_titles_fun);
	$rand = rand(0, $image_count-1);
	$image_index1 = $rand;
	$image_count = count($image_titles_screen);
	$rand = rand(0, $image_count-1);
	$image_index2 = $rand;

	/*
	//Needed while the two cells were calling from the same array, no longer needed --ATD
	$count = 0; // for safety
	do {
		$rand = rand(0, $image_count-1);
		$image_index2 = $rand;
		$count++;
	 	} while ($image_index2 == $image_index1 && $count < 10);
	*/

	echo "<a href=\"javascript:popupImage('/images/" . $image_titles_fun[$image_index1][0];
	//               echo "', '" . $image_titles[$image_index1][1] . "')\">";
	echo "', '')\">";
	echo "<img src=\"images/" . $image_titles_fun[$image_index1][0] . "\" width=200 border=0></a>";
	echo "<div align=\"top\"><font class=\"smallplain\"><BR>" . $image_titles_fun[$image_index1][1] . "</font></div><br><br>";
	echo "<a href=\"javascript:popupImage('images/" . $image_titles_screen[$image_index2][0];
	//               echo "', '" . $image_titles[$image_index2][1] . "')\">";
	echo "', '')\">";
	echo "<img src=\"/images/" . $image_titles_screen[$image_index2][0] . "\" width=200  border=0></a>";
	echo "<div align=\"top\"><font class=\"smallplain\"><BR>" . $image_titles_screen[$image_index2][1] . "<br><br></div>";
}

?>

<script type="text/javascript">
function popupImage(imageurl, imagecaption)
{
//This function is called to open a popup window with the url listed displayed as a picture
//Pre:  string containing URL of image source and string of caption text
//Post: Calls a new popup window with the imageurl displayed as a img file and caption displayed below it.
var image_win = window.open("", "image", "width=400,height=450,resizable=1,scrollbars=1");
image_win.document.write('<html><body bgcolor="white">');
image_win.document.write('<img src="'+imageurl+'">');
image_win.document.write('<p>'+imagecaption+'<\/p>');
image_win.document.write('<br><a href="javascript:window.close()">close<\/a>');
image_win.document.write('<\/body><\/html>');
}
</script>

<?
$temp = "\?\><script type=\"text/javascript\">document.write(menuNumber);</script>


\<\? ";
function new_head_javascript()
{
?>
<?
}
?>


<?
function new_head_image()
{
?>

<!-- the table width controls the width of the dark green subnav bar -->
<table width = 1044px> <!-- This width determines the maximum width of the Header field ; original was 1050px -->
			<tr>
			<td valign="top" width=100px><img src ="/images/new.jpg" ALT="Bean Picture" height = 85 border = 0 ></td>
				<td valign="top">
					<table cellpadding = 0 cellspacing = 0>
						<tr >
	          				<td width=700px> <!-- This determines the width of the text field of each page -->
<?
}
?>


<?
function new_head_sbt()
{
?>

	          				<font class = "largegreen"><i>SoyBase&nbsp;and&nbsp;the&nbsp;Soybean&nbsp;Breeder's&nbsp;Toolbox</i></font>
	          				<font class = "smallgreen"><br><b>Integrating&nbsp;Genetics&nbsp;and&nbsp;Molecular&nbsp;Biology&nbsp;for&nbsp;Soybean&nbsp;Researchers </b></font>

<?
}
?>


<?
function new_head_pmd()
{

?>

	          				<font class = "largegreen"><i>SoyBase&nbsp;and&nbsp;the&nbsp;Soybean&nbsp;Breeder's&nbsp;Toolbox</i></font>
		      				<font class = "smallgreen"><br><b>Integrating&nbsp;Genetics&nbsp;and&nbsp;Molecular&nbsp;Biology&nbsp;for&nbsp;Soybean&nbsp;Researchers</b></font><br>
<?
}
?>

<?
function new_head_soy()
{

?>

	         				<font class = "largegreen"><i>SoyBase&nbsp;and&nbsp;the&nbsp;Soybean&nbsp;Breeder's&nbsp;Toolbox</i></font>
	          				<font class = "smallgreen"><br><b>Integrating&nbsp;Genetics&nbsp;and&nbsp;Molecular&nbsp;Biology&nbsp;for&nbsp;Soybean&nbsp;Researchers </b></font><br>
<?
}
?>
